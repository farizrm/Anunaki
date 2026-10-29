import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "97");
const BSC_RPC_URL =
  CHAIN_ID === 56
    ? "https://bsc-dataseed.binance.org/"
    : "https://data-seed-prebsc-1-s1.binance.org:8545/";

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  process.env.TREASURY_WALLET_ADDRESS ||
  "0x494D364F303EbC7b421a5673ADC49a9369C59A43"
).toLowerCase();

// Simple IP Rate Limiter (Anti-Bot Spam)
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestMap.get(ip);
  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + 15000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count += 1;
  return true;
}

function getRequiredBnbForNextMint(currentMintedCount: number): number {
  const nextSeq = currentMintedCount + 1;
  if (nextSeq === 1) return 0;
  if (nextSeq === 2) return 0.0012;
  if (nextSeq === 3) return 0.0024;
  if (nextSeq === 4) return 0.0048;
  if (nextSeq === 5) return 0.0096;
  return 999;
}

// Helper: Read totalSupply() (0x18160ddd) directly from the Smart Contract
async function fetchOnChainTotalSupply(): Promise<number> {
  try {
    const res = await fetch(BSC_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: CONTRACT_ADDRESS,
            data: "0x18160ddd",
          },
          "latest",
        ],
      }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json?.result && json.result !== "0x") {
      return parseInt(json.result, 16);
    }
    return 0;
  } catch {
    return 0;
  }
}

// =========================================================================
// GET: Syncs On-Chain totalSupply() with Supabase & returns live mint status
// =========================================================================
export async function GET(req: NextRequest) {
  const wallet = (req.nextUrl.searchParams.get("wallet") || "").toLowerCase().trim();
  const onChainSupply = await fetchOnChainTotalSupply();

  let dbTotalMinted = 0;

  if (supabaseAdmin) {
    const { data: globalState } = await supabaseAdmin
      .from("mint_state")
      .select("total_minted, max_supply")
      .eq("id", 1)
      .maybeSingle();

    dbTotalMinted = globalState?.total_minted || 0;

    // Auto-sync Supabase if on-chain Smart Contract totalSupply is higher!
    if (onChainSupply > dbTotalMinted && onChainSupply <= 30000) {
      await supabaseAdmin
        .from("mint_state")
        .update({ total_minted: onChainSupply, updated_at: new Date().toISOString() })
        .eq("id", 1);
      dbTotalMinted = onChainSupply;
    }
  }

  const syncedGlobalTotal = Math.max(onChainSupply, dbTotalMinted);

  // If no specific wallet was queried, return global supply status
  if (!wallet) {
    return NextResponse.json({
      globalTotalMinted: syncedGlobalTotal,
      globalMaxSupply: 30000,
      contractAddress: CONTRACT_ADDRESS,
      chainId: CHAIN_ID,
    });
  }

  if (!/^0x[a-f0-9]{40}$/.test(wallet)) {
    return NextResponse.json({ error: "Invalid EVM wallet address" }, { status: 400 });
  }

  const { data: walletData } = supabaseAdmin
    ? await supabaseAdmin
        .from("wallet_mints")
        .select("minted_count, total_nun_allocated")
        .eq("wallet_address", wallet)
        .maybeSingle()
    : { data: null };

  const mintedCount = walletData?.minted_count || 0;
  const remainingQuota = Math.max(0, 5 - mintedCount);

  const upcomingPrices: Array<{ mintNumber: number; priceBnb: number }> = [];
  for (let i = mintedCount; i < 5; i++) {
    upcomingPrices.push({
      mintNumber: i + 1,
      priceBnb: getRequiredBnbForNextMint(i),
    });
  }

  return NextResponse.json({
    wallet,
    mintedCount,
    remainingQuota,
    nextMintPriceBnb: remainingQuota > 0 ? getRequiredBnbForNextMint(mintedCount) : null,
    upcomingPrices,
    totalNunAllocated: walletData?.total_nun_allocated || 0,
    globalTotalMinted: syncedGlobalTotal,
    globalMaxSupply: 30000,
  });
}

// =========================================================================
// POST: Verifies BSC Transaction Hash On-Chain & Records Atomic Mint in DB
// =========================================================================
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server database configuration missing" }, { status: 500 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 15 seconds." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const wallet = String(body.wallet || "").toLowerCase().trim();
    const txHash = String(body.txHash || "").toLowerCase().trim();

    if (!/^0x[a-f0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }
    if (!/^0x[a-f0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
    }

    const { data: walletRecord } = await supabaseAdmin
      .from("wallet_mints")
      .select("minted_count")
      .eq("wallet_address", wallet)
      .maybeSingle();

    const currentCount = walletRecord?.minted_count || 0;
    if (currentCount >= 5) {
      return NextResponse.json(
        { error: "Maximum limit of 5 NFTs per wallet reached" },
        { status: 403 }
      );
    }

    const requiredBnb = getRequiredBnbForNextMint(currentCount);

    const [txRes, receiptRes] = await Promise.all([
      fetch(BSC_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getTransactionByHash",
          params: [txHash],
        }),
      }).then((r) => r.json()),
      fetch(BSC_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_getTransactionReceipt",
          params: [txHash],
        }),
      }).then((r) => r.json()),
    ]);

    const tx = txRes?.result;
    const receipt = receiptRes?.result;

    if (!tx || !receipt || receipt.status !== "0x1") {
      return NextResponse.json(
        { error: "Transaction not found or failed on BNB Smart Chain" },
        { status: 400 }
      );
    }

    if (String(tx.from).toLowerCase() !== wallet) {
      return NextResponse.json(
        { error: "Transaction sender does not match wallet address" },
        { status: 403 }
      );
    }

    if (CONTRACT_ADDRESS && String(tx.to).toLowerCase() !== CONTRACT_ADDRESS) {
      return NextResponse.json(
        { error: "Transaction target does not match official ANUNAKI Contract" },
        { status: 403 }
      );
    }

    const paidWei = BigInt(tx.value || "0x0");
    const paidBnb = Number(paidWei) / 1e18;

    if (paidBnb + 0.000001 < requiredBnb) {
      return NextResponse.json(
        { error: `Insufficient BNB paid. Required: ${requiredBnb} BNB, Paid: ${paidBnb} BNB` },
        { status: 400 }
      );
    }

    const { data: mintResult, error: rpcError } = await supabaseAdmin.rpc(
      "execute_agentic_mint",
      {
        p_wallet: wallet,
        p_tx_hash: txHash,
        p_paid_bnb: paidBnb,
      }
    );

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 400 });
    }

    return NextResponse.json(mintResult, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}