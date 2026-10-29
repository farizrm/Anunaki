"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Copy,
  Check,
  Terminal,
  Shield,
  Zap,
  Layers,
  Coins,
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Cpu,
  Lock,
  Flame,
  Eye,
  Search,
  CheckCircle2,
  Wallet,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// ==========================================
// 0. PRODUCTION CONFIGURATION & SUPABASE INIT
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabasePublic =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Smart Contract & Network Config (Configurable via Vercel Environment Variables)
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x494D364F303EbC7b421a5673ADC49a9369C59A43";

// Set NEXT_PUBLIC_CHAIN_ID=56 in Vercel for Mainnet, or 97 for Testnet
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "97");
const IS_MAINNET = CHAIN_ID === 56;

const NETWORK_CONFIG = {
  chainId: CHAIN_ID,
  name: IS_MAINNET ? "BNB Smart Chain Mainnet" : "BNB Smart Chain Testnet",
  symbol: IS_MAINNET ? "BNB" : "tBNB",
  rpcUrl: IS_MAINNET
    ? "https://bsc-dataseed.binance.org/"
    : "https://data-seed-prebsc-1-s1.binance.org:8545/",
  explorerUrl: IS_MAINNET
    ? `https://bscscan.com/address/${CONTRACT_ADDRESS}`
    : `https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`,
};

// ==========================================
// 1. TYPESCRIPT INTERFACES & TYPES
// ==========================================
type RarityId = "common" | "uncommon" | "rare" | "ascended" | "ethernal" | "apex";

interface RarityTier {
  id: RarityId;
  label: string;
  count: number;
  supplyShare: string;
  color: string;
  border: string;
  bg: string;
  badge: string;
  bonus: number;
  desc: string;
}

interface NFTPalette {
  bg: string;
  primary: string;
  secondary: string;
  visor: string;
  aura: string;
}

interface NFTItem {
  id: number;
  name: string;
  rarity: RarityId;
  human: string;
  animal: string;
  alien: string;
  power: number;
  palette: NFTPalette;
}

// ==========================================
// 2. RARITY TIERS & PROJECT CONFIGURATION
// ==========================================
const RARITY_TIERS: RarityTier[] = [
  {
    id: "common",
    label: "Common",
    count: 24,
    supplyShare: "45% Pool",
    color: "text-slate-300",
    border: "border-slate-500/40",
    bg: "bg-slate-900/70",
    badge: "bg-slate-800 text-slate-300 border-slate-600",
    bonus: 0,
    desc: "Base genetic splice combining terran operatives with predator instincts and outer-rim signal implants.",
  },
  {
    id: "uncommon",
    label: "Uncommon",
    count: 18,
    supplyShare: "25% Pool",
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/30",
    badge: "bg-emerald-950/90 text-emerald-300 border-emerald-500/50",
    bonus: 0,
    desc: "Enhanced neural reflexes with stabilized animalistic mutation and Nibiru ocular array.",
  },
  {
    id: "rare",
    label: "Rare",
    count: 12,
    supplyShare: "15% Pool",
    color: "text-cyan-400",
    border: "border-cyan-500/50",
    bg: "bg-cyan-950/30",
    badge: "bg-cyan-950/90 text-cyan-300 border-cyan-400/50",
    bonus: 3000,
    desc: "High-ranking Vanguard units carrying resonant alien plasma cores and eligible for tier-1 bonus $NUN yield.",
  },
  {
    id: "ascended",
    label: "Ascended",
    count: 9,
    supplyShare: "9% Pool",
    color: "text-purple-400",
    border: "border-purple-500/50",
    bg: "bg-purple-950/30",
    badge: "bg-purple-950/90 text-purple-300 border-purple-400/50",
    bonus: 6500,
    desc: "Transcended hybrid commanders capable of direct telepathic synchronization with autonomous on-chain agents.",
  },
  {
    id: "ethernal",
    label: "Ethernal",
    count: 6,
    supplyShare: "4.5% Pool",
    color: "text-rose-400",
    border: "border-rose-500/60",
    bg: "bg-rose-950/30",
    badge: "bg-rose-950/90 text-rose-300 border-rose-400/60",
    bonus: 10000,
    desc: "Immortal dimensional weavers forged in dark-matter reactors; near-perfect triad equilibrium.",
  },
  {
    id: "apex",
    label: "Apex",
    count: 3,
    supplyShare: "1.5% Pool",
    color: "text-amber-400",
    border: "border-amber-400/80",
    bg: "bg-amber-950/40",
    badge: "bg-amber-950/90 text-amber-300 border-amber-400/80",
    bonus: 15000,
    desc: "The supreme progenitors of the Anunaki Genesis protocol. Maximum governance weight and top $NUN bonus.",
  },
];

const PALETTE_MAP: Record<RarityId, NFTPalette> = {
  common: {
    bg: "#0f172a",
    primary: "#94a3b8",
    secondary: "#475569",
    visor: "#38bdf8",
    aura: "#64748b",
  },
  uncommon: {
    bg: "#062e22",
    primary: "#34d399",
    secondary: "#059669",
    visor: "#a7f3d0",
    aura: "#10b981",
  },
  rare: {
    bg: "#082f49",
    primary: "#22d3ee",
    secondary: "#0284c7",
    visor: "#fef08a",
    aura: "#06b6d4",
  },
  ascended: {
    bg: "#2e1065",
    primary: "#c084fc",
    secondary: "#7e22ce",
    visor: "#67e8f9",
    aura: "#a855f7",
  },
  ethernal: {
    bg: "#4c0519",
    primary: "#fb7185",
    secondary: "#be123c",
    visor: "#fde08a",
    aura: "#f43f5e",
  },
  apex: {
    bg: "#451a03",
    primary: "#fbbf24",
    secondary: "#d97706",
    visor: "#ffffff",
    aura: "#f59e0b",
  },
};

// ==========================================
// 3. COMPLETE 72 NFT ARCHETYPE DATABASE
// ==========================================
const RAW_ARCHETYPES: Array<{
  name: string;
  rarity: RarityId;
  human: string;
  animal: string;
  alien: string;
}> = [
  // APEX (3) - IDs 1 to 3
  { name: "Anu-Prime Enlil", rarity: "apex", human: "Sovereign King", animal: "Golden Winged Lion", alien: "Nibiru Solar Crown" },
  { name: "Enki Voidweaver", rarity: "apex", human: "High Architect", animal: "Abyssal Leviathan", alien: "Quantum Mind-Tendrils" },
  { name: "Tiamat Star-Eater", rarity: "apex", human: "Valkyrie Empress", animal: "Celestial Hydra", alien: "Nova Singularity Core" },

  // ETHERNAL (6) - IDs 4 to 9
  { name: "Marduk Solaris", rarity: "ethernal", human: "Solar Praetorian", animal: "Phoenix Falcon", alien: "Photonic Halo Array" },
  { name: "Inanna Starlight", rarity: "ethernal", human: "High Priestess", animal: "Snow Leopard", alien: "Nebula Third-Eye" },
  { name: "Nergal AbyssWalker", rarity: "ethernal", human: "Shadow Warlord", animal: "Obsidian Direwolf", alien: "Antimatter Exoskeleton" },
  { name: "Ninurta ThunderClaw", rarity: "ethernal", human: "Storm Paladin", animal: "Sabertooth Tiger", alien: "Arc-Plasma Gauntlets" },
  { name: "Ereshkigal Veil", rarity: "ethernal", human: "Necro-Siren", animal: "King Cobra", alien: "Void Frequency Horns" },
  { name: "Dumuzid Aetherius", rarity: "ethernal", human: "Chrono Shepherd", animal: "Astral Stag", alien: "Crystalline Cranium" },

  // ASCENDED (9) - IDs 10 to 18
  { name: "Utu Dawnbringer", rarity: "ascended", human: "Cyber Templar", animal: "Golden Eagle", alien: "Helios Laser Visor" },
  { name: "Nanna Moonstalker", rarity: "ascended", human: "Silent Shinobi", animal: "Silver Panther", alien: "Lunar Gravity Orbs" },
  { name: "Ishkur Tempest", rarity: "ascended", human: "Valkyrie Striker", animal: "Thunder Roc", alien: "Ionized Wing-Matrix" },
  { name: "Ninhursag Bio-Queen", rarity: "ascended", human: "Genetic Savant", animal: "Emerald Mantis", alien: "Spore-Link Antennae" },
  { name: "Gibil Flameheart", rarity: "ascended", human: "Forge Master", animal: "Komodo Dragon", alien: "Thermonuclear Carapace" },
  { name: "Nisaba Code-Scribe", rarity: "ascended", human: "Neural Oracle", animal: "Barn Owl", alien: "Holographic Synapse Crown" },
  { name: "Nabu Logic-Prime", rarity: "ascended", human: "Grand Strategist", animal: "Arctic Fox", alien: "Tachyon Optical Tri-Lens" },
  { name: "Bau Life-Weaver", rarity: "ascended", human: "Bio-Medic Commander", animal: "White Crane", alien: "Nanite Regeneration Halo" },
  { name: "Pazuzu Wind-Reaver", rarity: "ascended", human: "Sky Corsair", animal: "Harpy Eagle", alien: "Sonic Vortex Talons" },

  // RARE (12) - IDs 19 to 30
  { name: "Gilga-Vanguard", rarity: "rare", human: "Heavy Centurion", animal: "Silverback Gorilla", alien: "Graviton Shoulder Pods" },
  { name: "Enkidu Wild-Core", rarity: "rare", human: "Brawler Berserker", animal: "Bison Bull", alien: "Emerald Horn Implants" },
  { name: "Shamash Ray-Gunner", rarity: "rare", human: "Orbital Marksman", animal: "Peregrine Falcon", alien: "Photon Targeter Eye" },
  { name: "Ishtar Pulse-Blade", rarity: "rare", human: "Dual-Blade Duelist", animal: "Cheetah", alien: "Neon Reflex Condenser" },
  { name: "Assur Iron-Fang", rarity: "rare", human: "Siege Breacher", animal: "Kodiak Bear", alien: "Plasma Jaw-Clamp" },
  { name: "Sin Night-Watcher", rarity: "rare", human: "Recon Ghost", animal: "Vampire Bat", alien: "Sonar Crest Receptor" },
  { name: "Adad Cloud-Splitter", rarity: "rare", human: "Shock Trooper", animal: "Electric Eel", alien: "Volt-Coil Spine" },
  { name: "Dagon Deep-Diver", rarity: "rare", human: "Trench Marine", animal: "Great White Shark", alien: "Hydro-Gill Cybernetics" },
  { name: "Tammuz Cyber-Hound", rarity: "rare", human: "Tracker Operative", animal: "Doberman Alpha", alien: "Infrared Snout Array" },
  { name: "Asherah Star-Root", rarity: "rare", human: "Botanic Druid", animal: "Chameleon", alien: "Prism Camo Skin" },
  { name: "Mot Grim-Harvester", rarity: "rare", human: "Reaper Executioner", animal: "Black Vulture", alien: "Entropy Scythe Arm" },
  { name: "Anat War-Maiden", rarity: "rare", human: "Shield Maiden", animal: "Wolverine", alien: "Adamantine Bone-Spurs" },

  // UNCOMMON (18) - IDs 31 to 48
  { name: "Kingu Viper-Unit", rarity: "uncommon", human: "Infiltrator", animal: "Pit Viper", alien: "Acid-Spit Mandibles" },
  { name: "Lahmu Silt-Strider", rarity: "uncommon", human: "Desert Ranger", animal: "Scorpion", alien: "Chitin Tail Stinger" },
  { name: "Kishar Horizon-Scout", rarity: "uncommon", human: "Outrider", animal: "Gazelle", alien: "Hyper-Stride Tendons" },
  { name: "Anshar Sky-Sentry", rarity: "uncommon", human: "Jetpack Trooper", animal: "Albatross", alien: "Aero-Glide Membrane" },
  { name: "Mummu Mist-Technic", rarity: "uncommon", human: "Cryo Engineer", animal: "Polar Bear", alien: "Frost-Core Respirator" },
  { name: "Lugalbanda Swift-Foot", rarity: "uncommon", human: "Courier Runner", animal: "Jackrabbit", alien: "Kinetic Ankle Thrusters" },
  { name: "Ninsun Oracle-Guard", rarity: "uncommon", human: "Temple Sentinel", animal: "Ibex Ram", alien: "Psionic Horn Resonator" },
  { name: "Geshtinanna Vine-Whip", rarity: "uncommon", human: "Cyber Hacker", animal: "Tree Frog", alien: "Bio-Luminescent Fingers" },
  { name: "Ningishzida Twin-Coils", rarity: "uncommon", human: "Field Medic", animal: "Coral Snake", alien: "Caduceus Drone Link" },
  { name: "Shara Bow-Stalker", rarity: "uncommon", human: "Compound Archer", animal: "Lynx", alien: "Hawkeye Stabilizer" },
  { name: "Zababa Pike-Breaker", rarity: "uncommon", human: "Frontline Lancer", animal: "Black Rhino", alien: "Kinetic Impact Horn" },
  { name: "Nanshe Tide-Seer", rarity: "uncommon", human: "Sonar Navigator", animal: "Dolphin", alien: "Echo-Dome Forehead" },
  { name: "Ninazu Venom-Doc", rarity: "uncommon", human: "Toxin Chemist", animal: "Gila Monster", alien: "Venom-Gland Gauntlet" },
  { name: "Enbilulu Canal-Guard", rarity: "uncommon", human: "Heavy Gunner", animal: "Hippopotamus", alien: "Hydraulic Jaw Armor" },
  { name: "Sirara Reef-Stalker", rarity: "uncommon", human: "Sub-Aqua Saboteur", animal: "Moray Eel", alien: "Biolight Dorsal Fin" },
  { name: "Ishhara Oath-Keeper", rarity: "uncommon", human: "Arbiter Enforcer", animal: "Deathstalker Scorpion", alien: "Truth-Scan Ocular" },
  { name: "Ninkasi Brew-Alchemist", rarity: "uncommon", human: "Stim-Synthesizer", animal: "Honey Badger", alien: "Adrenaline Injector Back" },
  { name: "Nusku Ember-Scout", rarity: "uncommon", human: "Pyro Vanguard", animal: "Fire Salamander", alien: "Thermal Vision Crest" },

  // COMMON (24) - IDs 49 to 72
  { name: "Igigi Grunt-01", rarity: "common", human: "Mining Trooper", animal: "Mole Rat", alien: "Drill-Claw Prosthetic" },
  { name: "Igigi Watcher-02", rarity: "common", human: "Perimeter Guard", animal: "Meerkat", alien: "Periscope Optic Node" },
  { name: "Ziusudra Ark-Hand", rarity: "common", human: "Hull Welder", animal: "Beaver", alien: "Plasma Torch Forearm" },
  { name: "Atrahasis Clay-Born", rarity: "common", human: "Infantry Recruit", animal: "Wild Boar", alien: "Tusk-Plate Respirator" },
  { name: "Etana Eagle-Rider", rarity: "common", human: "Drop-Pod Pilot", animal: "Kestrel", alien: "G-Force Neural Plug" },
  { name: "Adapa Reef-Fisher", rarity: "common", human: "Harpoon Gunner", animal: "Barracuda", alien: "Scale-Mesh Vest" },
  { name: "Enmerkar Wall-Builder", rarity: "common", human: "Fortress Mason", animal: "Armadillo", alien: "Plasteel Shell Pack" },
  { name: "Ensuhgiranna Runner", rarity: "common", human: "Signal Relay", animal: "Greyhound", alien: "Sub-Space Radio Ear" },
  { name: "Aruru Clay-Shaper", rarity: "common", human: "Drone Mechanic", animal: "Weaver Ant", alien: "Multi-Tool Mandibles" },
  { name: "Nammu Salt-Diver", rarity: "common", human: "Salvage Diver", animal: "Sea Turtle", alien: "O2 Rebreather Carapace" },
  { name: "Utnapishtim Survivor", rarity: "common", human: "Wasteland Nomad", animal: "Camel", alien: "Rad-Filter Hump Module" },
  { name: "Siduri Tavern-AI", rarity: "common", human: "Info Broker", animal: "Raven", alien: "Voice-Mimic Larynx" },
  { name: "Urshanabi Ferryman", rarity: "common", human: "Warp-Barge Pilot", animal: "Hammerhead Shark", alien: "Wide-Angle Nav-Eyes" },
  { name: "Humbaba Cedar-Guard", rarity: "common", human: "Forest Warden", animal: "Grizzly", alien: "Bark-Skin Subdermal" },
  { name: "Gugalanna Bull-Drone", rarity: "common", human: "Riot Enforcer", animal: "Water Buffalo", alien: "Stun-Baton Horns" },
  { name: "Asag Rock-Biter", rarity: "common", human: "Tunnel Blaster", animal: "Snapping Turtle", alien: "Seismic Jaw Sensor" },
  { name: "Sharur Mace-Bearer", rarity: "common", human: "Shock Infantry", animal: "Pachycephalosaurus", alien: "Reinforced Cranium Dome" },
  { name: "Anzu Feather-Thief", rarity: "common", human: "Loot Scavenger", animal: "Magpie", alien: "Magnetic Talon Grip" },
  { name: "Kur-Dragon Hatchling", rarity: "common", human: "Flamethrower Unit", animal: "Horned Lizard", alien: "Napalm Sac Throat" },
  { name: "Alalu Exiled-Scout", rarity: "common", human: "Dune Patrol", animal: "Fennec Fox", alien: "Wide-Dish Audio Ears" },
  { name: "Ki-Earth Trenchman", rarity: "common", human: "Sapper Engineer", animal: "Badger", alien: "Trench-Claw Gloves" },
  { name: "Gula Pulse-Medic", rarity: "common", human: "Combat Orderly", animal: "St. Bernard Hound", alien: "Defib-Pad Palms" },
  { name: "Damu Sap-Collector", rarity: "common", human: "Bio-Harvester", animal: "Hummingbird", alien: "Siphon-Needle Mask" },
  { name: "Irra Plague-Sentry", rarity: "common", human: "Hazmat Trooper", animal: "Crow", alien: "Beak-Filter Gas Mask" },
];

const NFT_DATABASE: NFTItem[] = RAW_ARCHETYPES.map((item, idx) => ({
  id: idx + 1,
  name: item.name,
  rarity: item.rarity,
  human: item.human,
  animal: item.animal,
  alien: item.alien,
  power:
    item.rarity === "apex"
      ? 98 + (idx % 3)
      : item.rarity === "ethernal"
      ? 90 + (idx % 7)
      : item.rarity === "ascended"
      ? 80 + (idx % 9)
      : item.rarity === "rare"
      ? 68 + (idx % 11)
      : item.rarity === "uncommon"
      ? 52 + (idx % 14)
      : 35 + (idx % 16),
  palette: PALETTE_MAP[item.rarity],
}));

// ==========================================
// 4. PROCEDURAL 2D PIXEL ART SVG GENERATOR
// ==========================================
function PixelArtCharacterSVG({
  nft,
  size = "lg",
}: {
  nft: NFTItem;
  size?: "sm" | "md" | "lg";
}) {
  const { id, palette, rarity } = nft;
  const earVariant = id % 4;
  const visorVariant = id % 3;
  const alienCrown = rarity === "apex" || rarity === "ethernal" || id % 3 === 0;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
      <svg
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        className="w-full h-full"
        style={{ backgroundColor: palette.bg }}
      >
        <rect x="1" y="1" width="1" height="1" fill={palette.aura} opacity="0.35" />
        <rect x="14" y="2" width="1" height="1" fill={palette.visor} opacity="0.4" />
        <rect x="2" y="12" width="1" height="1" fill={palette.primary} opacity="0.25" />
        <rect x="13" y="11" width="1" height="1" fill={palette.aura} opacity="0.35" />

        {(rarity === "apex" || rarity === "ethernal" || rarity === "ascended") && (
          <>
            <rect x="3" y="2" width="10" height="1" fill={palette.aura} opacity="0.35" />
            <rect x="2" y="4" width="1" height="7" fill={palette.aura} opacity="0.3" />
            <rect x="13" y="4" width="1" height="7" fill={palette.aura} opacity="0.3" />
          </>
        )}

        {earVariant === 0 && (
          <>
            <rect x="4" y="2" width="2" height="2" fill={palette.secondary} />
            <rect x="10" y="2" width="2" height="2" fill={palette.secondary} />
          </>
        )}
        {earVariant === 1 && (
          <>
            <rect x="3" y="1" width="1" height="3" fill={palette.primary} />
            <rect x="4" y="2" width="1" height="2" fill={palette.secondary} />
            <rect x="12" y="1" width="1" height="3" fill={palette.primary} />
            <rect x="11" y="2" width="1" height="2" fill={palette.secondary} />
          </>
        )}
        {earVariant === 2 && (
          <>
            <rect x="4" y="1" width="1" height="3" fill={palette.visor} />
            <rect x="11" y="1" width="1" height="3" fill={palette.visor} />
          </>
        )}
        {earVariant === 3 && (
          <>
            <rect x="3" y="3" width="2" height="2" fill={palette.secondary} />
            <rect x="11" y="3" width="2" height="2" fill={palette.secondary} />
          </>
        )}

        {alienCrown && (
          <>
            <rect x="7" y="1" width="2" height="2" fill={palette.visor} />
            <rect x="6" y="2" width="4" height="1" fill={palette.primary} />
          </>
        )}

        <rect x="5" y="3" width="6" height="6" fill={palette.primary} />
        <rect x="4" y="4" width="8" height="4" fill={palette.primary} />
        <rect x="7" y="4" width="2" height="1" fill={palette.visor} />

        {visorVariant === 0 && (
          <rect x="5" y="5" width="6" height="2" fill={palette.visor} />
        )}
        {visorVariant === 1 && (
          <>
            <rect x="5" y="5" width="2" height="2" fill={palette.visor} />
            <rect x="9" y="5" width="2" height="2" fill={palette.visor} />
            <rect x="7" y="6" width="2" height="1" fill={palette.secondary} />
          </>
        )}
        {visorVariant === 2 && (
          <>
            <rect x="4" y="5" width="8" height="1" fill={palette.visor} />
            <rect x="6" y="6" width="4" height="1" fill={palette.visor} />
          </>
        )}

        <rect x="6" y="7" width="4" height="2" fill={palette.secondary} />
        <rect x="6" y="8" width="1" height="1" fill="#ffffff" />
        <rect x="9" y="8" width="1" height="1" fill="#ffffff" />

        <rect x="4" y="9" width="8" height="5" fill={palette.secondary} />
        <rect x="3" y="10" width="10" height="4" fill={palette.primary} />

        <rect x="7" y="10" width="2" height="2" fill={palette.visor} />
        <rect x="6" y="12" width="4" height="1" fill={palette.secondary} />

        <rect x="2" y="9" width="2" height="3" fill={palette.secondary} />
        <rect x="12" y="9" width="2" height="3" fill={palette.secondary} />

        <rect x="4" y="14" width="8" height="2" fill="#020617" />
      </svg>

      {size === "lg" && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      )}
    </div>
  );
}

// ==========================================
// 5. FAQ DATA
// ==========================================
const FAQ_ITEMS = [
  {
    q: "What is the total supply and how are the 72 archetypes distributed?",
    a: "The ANUNAKI Genesis Event operates on a strict First-Come, First-Served (FCFS) cap of 30,000 NFTs. Every minted NFT is randomly forged from our 72 hand-crafted 2D pixel-art archetypes—fusing Human operatives, Animal apex instincts, and Alien Nibiru technology across 6 rarity tiers: Common (24), Uncommon (18), Rare (12), Ascended (9), Ethernal (6), and Apex (3).",
  },
  {
    q: "How does the Agentic Wallet automated minting prompt work?",
    a: "No manual coding or complex dApp signature troubleshooting is required. When you click 'Mint via Agentic Prompt', you receive an execution command to paste directly into your Binance Agentic Wallet AI. Your Agent automatically queries the smart contract for your wallet's prior mint history, calculates your live BNB balance, and renders two interactive action buttons: [Mint All] (automatically mints the maximum NFTs your balance can afford up to the 5-NFT wallet limit) and [Mint 1].",
  },
  {
    q: "How is the dynamic mint pricing calculated on-chain?",
    a: "Every eligible Agentic ID holder receives their 1st NFT claim for FREE (0 BNB + standard network gas). From the 2nd claim onward, the smart contract automatically enforces an exponential x2 pricing curve regardless of whether you mint via prompt or direct contract call: 2nd Mint = 0.0012 BNB, 3rd Mint = 0.0024 BNB, 4th Mint = 0.0048 BNB, and 5th Mint = 0.0096 BNB. Maximum limit is strictly 5 NFTs per wallet.",
  },
  {
    q: "What are the $NUN token rewards and rarity bonuses for holders?",
    a: "Every ANUNAKI NFT holder is guaranteed a base allocation of 100,000 $NUN tokens per NFT held. Furthermore, holders of Rare-tier and above receive an additional rarity bonus per NFT: Rare (+3,000 $NUN), Ascended (+6,500 $NUN), Ethernal (+10,000 $NUN), and Apex (+15,000 $NUN).",
  },
  {
    q: "Who pays for the network gas fees?",
    a: "All blockchain transaction gas fees on the BNB Smart Chain (BSC) are borne by the user. Even on your 1st free mint, ensure your Agentic Wallet holds a small buffer of BNB to cover standard BSC network execution gas.",
  },
];

// ==========================================
// 6. MAIN SINGLE-PAGE APPLICATION
// ==========================================
export default function AnunakiApp() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("mint");

  // Showcase & Real-Time Minted Counter (Starts at 0 — No Dummy Numbers)
  const [currentShowcaseIdx, setCurrentShowcaseIdx] = useState<number>(0);
  const [isPausedShowcase, setIsPausedShowcase] = useState<boolean>(false);
  const [totalMinted, setTotalMinted] = useState<number>(0);
  const [isSyncingChain, setIsSyncingChain] = useState<boolean>(false);

  // Prompt Modal state
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // About / Archetype Explorer state
  const [activeRarityFilter, setActiveRarityFilter] = useState<"all" | RarityId>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);

  // Future $NUN Reward Calculator state
  const [calcCounts, setCalcCounts] = useState<Record<RarityId, number>>({
    common: 1,
    uncommon: 0,
    rare: 1,
    ascended: 0,
    ethernal: 0,
    apex: 0,
  });

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auto-cycle the 72 NFTs in the Hero Mint section
  useEffect(() => {
    if (isPausedShowcase) return;
    const interval = setInterval(() => {
      setCurrentShowcaseIdx((prev) => (prev + 1) % NFT_DATABASE.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPausedShowcase]);

  // Direct On-Chain totalSupply() Reader + Backend Sync
  const syncLiveSupply = useCallback(async () => {
    try {
      setIsSyncingChain(true);

      // 1. Read totalSupply() (selector 0x18160ddd) directly from BNB Smart Chain RPC
      const rpcResponse = await fetch(NETWORK_CONFIG.rpcUrl, {
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
      });

      const rpcJson = await rpcResponse.json();
      let onChainSupply = 0;
      if (rpcJson?.result && rpcJson.result !== "0x") {
        onChainSupply = parseInt(rpcJson.result, 16);
      }

      // 2. Also call our Next.js backend API to sync on-chain totalSupply with Supabase
      const apiResponse = await fetch("/api/mint?sync=true", { cache: "no-store" }).catch(
        () => null
      );
      let dbSupply = 0;
      if (apiResponse && apiResponse.ok) {
        const apiData = await apiResponse.json();
        dbSupply = Number(apiData?.globalTotalMinted || 0);
      }

      const highestVerifiedTotal = Math.max(
        0,
        Math.min(30000, Math.max(onChainSupply || 0, dbSupply || 0))
      );
      setTotalMinted(highestVerifiedTotal);
    } catch {
      // Fallback silently if offline
    } finally {
      setIsSyncingChain(false);
    }
  }, []);

  // Real-Time Hybrid Subscription (On-Chain RPC + Supabase WebSocket)
  useEffect(() => {
    // Immediate sync on page load
    syncLiveSupply();

    // Periodic lightweight on-chain check every 12 seconds so external mints update automatically
    const pollInterval = setInterval(syncLiveSupply, 12000);

    // Real-time Supabase WebSocket listener for instant push updates
    if (!supabasePublic) {
      return () => clearInterval(pollInterval);
    }

    const channel = supabasePublic
      .channel("anunaki_live_mint_counter")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mint_state",
          filter: "id=eq.1",
        },
        (payload) => {
          const updatedTotal = (payload.new as { total_minted?: number })?.total_minted;
          if (typeof updatedTotal === "number") {
            setTotalMinted((prev) => Math.max(prev, updatedTotal));
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabasePublic.removeChannel(channel);
    };
  }, [syncLiveSupply]);

  // Scroll spy for navigation highlight
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["mint", "about", "future", "rules", "faq"];
      const scrollPos = window.scrollY + 240;
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentShowcaseNft = NFT_DATABASE[currentShowcaseIdx];
  const mintedPercentage = ((totalMinted / 30000) * 100).toFixed(2);

  // Filtered 72 NFTs for About Section
  const filteredNfts = useMemo(() => {
    return NFT_DATABASE.filter((nft) => {
      const matchesRarity =
        activeRarityFilter === "all" || nft.rarity === activeRarityFilter;
      const matchesSearch =
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.human.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.alien.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `#${nft.id}`.includes(searchQuery);
      return matchesRarity && matchesSearch;
    });
  }, [activeRarityFilter, searchQuery]);

  // Calculate $NUN Allocation
  const nunCalculation = useMemo(() => {
    let totalNfts = 0;
    let baseTokens = 0;
    let bonusTokens = 0;

    RARITY_TIERS.forEach((tier) => {
      const qty = calcCounts[tier.id] || 0;
      totalNfts += qty;
      baseTokens += qty * 100000;
      bonusTokens += qty * tier.bonus;
    });

    return {
      totalNfts,
      baseTokens,
      bonusTokens,
      grandTotal: baseTokens + bonusTokens,
    };
  }, [calcCounts]);

  const updateCalcCount = (tierId: RarityId, delta: number) => {
    setCalcCounts((prev) => ({
      ...prev,
      [tierId]: Math.max(0, Math.min(20, (prev[tierId] || 0) + delta)),
    }));
  };

  // Universal Agentic Wallet Prompt (Automatically adapts to Mainnet or Testnet)
  const agenticMintPrompt = useMemo(() => {
    return `[ANUNAKI AGENTIC PROTOCOL — AUTOMATED MINT EXECUTION]
Target Collection: ANUNAKI Genesis (2D Pixel Triad)
Network: ${NETWORK_CONFIG.name} (ChainID ${NETWORK_CONFIG.chainId})
Contract Address: ${CONTRACT_ADDRESS}
Contract Function: mint(uint256 quantity) payable
Allocation Mode: FCFS (30,000 Hard Cap) | Max 5 NFTs per Wallet

Agent Instructions:
1. Verify my connected Binance Agentic Wallet ID and read my current on-chain mint count via walletMintedCount(address) on the ANUNAKI Genesis Contract (${CONTRACT_ADDRESS}).
2. Calculate the exact dynamic price for my next available mint slot(s) up to the 5-NFT wallet cap using getBatchCost(address, quantity):
   - Mint #1: FREE (0.0000 ${NETWORK_CONFIG.symbol} + network gas)
   - Mint #2: 0.0012 ${NETWORK_CONFIG.symbol}
   - Mint #3: 0.0024 ${NETWORK_CONFIG.symbol} (x2)
   - Mint #4: 0.0048 ${NETWORK_CONFIG.symbol} (x2)
   - Mint #5: 0.0096 ${NETWORK_CONFIG.symbol} (x2)
3. Check my live ${NETWORK_CONFIG.symbol} wallet balance (reserving gas buffer) and determine the maximum number of NFTs (N) my balance can afford within my remaining wallet limit.
4. Present me with two interactive execution buttons right now:
   - [Mint All] : Call mint(N) with msg.value = getBatchCost(myAddress, N).
   - [Mint 1]   : Call mint(1) with msg.value = getBatchCost(myAddress, 1).`;
  }, []);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(agenticMintPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Subtle Futuristic Cyber Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.18), transparent 60%), linear-gradient(to right, rgba(30,41,59,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.35) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      {/* ==========================================
          STICKY HEADER NAVIGATION
      ========================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#040711]/85 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => scrollToSection("mint")}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-cyan-400 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-lg sm:text-xl bg-gradient-to-r from-white via-cyan-200 to-amber-300 bg-clip-text text-transparent">
                  ANUNAKI
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                  Agentic Event
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Binance Web3 Agentic Wallet Launchpad
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-full p-1.5">
            {[
              { id: "mint", label: "Mint" },
              { id: "about", label: "About" },
              { id: "future", label: "Future" },
              { id: "rules", label: "Rules" },
              { id: "faq", label: "FAQ" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-md shadow-cyan-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Quick Mint Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsPromptModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>Agentic Mint</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2">
            {[
              { id: "mint", label: "Mint" },
              { id: "about", label: "About" },
              { id: "future", label: "Future" },
              { id: "rules", label: "Rules" },
              { id: "faq", label: "FAQ" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                  activeSection === item.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsPromptModalOpen(true);
              }}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Agentic Mint Prompt</span>
            </button>
          </div>
        )}
      </header>

      {/* ==========================================
          SECTION 1: MINT (HERO & LIVE FCFS TRACKER)
      ========================================== */}
      <section
        id="mint"
        className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Lore, Real-Time Progress Bar & Agentic Mint Trigger */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE ON BINANCE WEB3 AGENTIC WALLET • FCFS 30,000 CAP</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
              THE GENESIS TRIAD:{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">
                ANUNAKI
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              An ancient extra-dimensional splice of{" "}
              <strong className="text-white">Human Tactical Operatives</strong>,{" "}
              <strong className="text-emerald-300">Apex Animal Instincts</strong>, and{" "}
              <strong className="text-amber-300">Alien Nibiru Cybernetics</strong>. Forged in 72
              distinct 2D pixel-art archetypes and engineered natively for autonomous AI execution
              via the Binance Agentic Wallet.
            </p>

            {/* Real-Time Total Minted Progress Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl shadow-cyan-950/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                      Real-Time On-Chain FCFS Status
                    </span>
                    <button
                      onClick={syncLiveSupply}
                      title="Refresh On-Chain Supply"
                      className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isSyncingChain ? "animate-spin text-cyan-400" : ""}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {totalMinted.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-sm font-mono">/ 30,000 Minted</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    {mintedPercentage}% Claimed
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Remaining: {(30000 - totalMinted).toLocaleString()} NFTs
                  </p>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-4 rounded-full bg-slate-950 border border-slate-800 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-amber-400 to-purple-500 transition-all duration-700 relative"
                  style={{ width: `${Math.max(0.5, Number(mintedPercentage))}%` }}
                />
              </div>

              {/* Key Highlights Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <p className="text-[11px] text-slate-400">1st Claim (Agentic ID)</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-400">FREE + Gas</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <p className="text-[11px] text-slate-400">2nd Claim Base</p>
                  <p className="text-xs sm:text-sm font-bold text-amber-300">0.0012 BNB</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <p className="text-[11px] text-slate-400">Wallet Hard Cap</p>
                  <p className="text-xs sm:text-sm font-bold text-cyan-300">Max 5 NFTs</p>
                </div>
              </div>

              {/* Verified Contract Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
                <span className="truncate">
                  Contract: <strong className="text-slate-200">{CONTRACT_ADDRESS}</strong>
                </span>
                <a
                  href={NETWORK_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline shrink-0"
                >
                  <span>View on BscScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => setIsPromptModalOpen(true)}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
              >
                <Terminal className="w-5 h-5" />
                <span>MINT VIA AGENTIC PROMPT</span>
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Inspect 72 Archetypes</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Rotating 72 NFT Pixel Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-950 p-1 shadow-2xl shadow-cyan-500/15 border border-cyan-500/30">
              <div className="bg-slate-950 rounded-[22px] p-5 sm:p-6 space-y-5">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                      Live Archetype Scanner ({currentShowcaseNft.id}/72)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPausedShowcase(!isPausedShowcase)}
                    className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                  >
                    {isPausedShowcase ? "Resume Cycle" : "Freeze Frame"}
                  </button>
                </div>

                {/* 2D Pixel Art Display Frame */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner group">
                  <PixelArtCharacterSVG nft={currentShowcaseNft} size="lg" />

                  {/* Rarity Pill Overlay */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${
                        RARITY_TIERS.find((r) => r.id === currentShowcaseNft.rarity)?.badge
                      }`}
                    >
                      {currentShowcaseNft.rarity}
                    </span>
                  </div>

                  {/* Power Index Overlay */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700 text-xs font-mono text-amber-300">
                    PWR {currentShowcaseNft.power}
                  </div>

                  {/* Bottom Character Info Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-mono text-cyan-400">
                        ARCHETYPE #{String(currentShowcaseNft.id).padStart(2, "0")}
                      </p>
                      <h3 className="text-lg font-black text-white">
                        {currentShowcaseNft.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedNft(currentShowcaseNft)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700"
                      title="Inspect DNA"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hybrid Triad Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Human DNA
                    </span>
                    <span className="text-xs font-bold text-white truncate block mt-0.5">
                      {currentShowcaseNft.human}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                      Animal Instinct
                    </span>
                    <span className="text-xs font-bold text-white truncate block mt-0.5">
                      {currentShowcaseNft.animal}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block">
                      Alien Tech
                    </span>
                    <span className="text-xs font-bold text-white truncate block mt-0.5">
                      {currentShowcaseNft.alien}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2: ABOUT (RARITY MATRIX & 72 ARCHETYPES)
      ========================================== */}
      <section
        id="about"
        className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80"
      >
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono uppercase tracking-wider">
            72 Genetically Engineered 2D Pixel Archetypes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            RARITY HIERARCHY & ARCHIVE
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every ANUNAKI NFT is forged from a curated pool of 72 hybrid pixel-art characters. Each
            unit blends human combat mastery, animalistic predation, and extraterrestrial Nibiru
            cybernetics across 6 rarity classifications.
          </p>
        </div>

        {/* 6 Rarity Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {RARITY_TIERS.map((tier) => (
            <div
              key={tier.id}
              onClick={() =>
                setActiveRarityFilter(activeRarityFilter === tier.id ? "all" : tier.id)
              }
              className={`cursor-pointer p-5 rounded-2xl border transition-all ${tier.bg} ${
                tier.border
              } ${
                activeRarityFilter === tier.id
                  ? "ring-2 ring-cyan-400 scale-[1.01]"
                  : "hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-black uppercase ${tier.color}`}>
                  {tier.label}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                  {tier.count} Archetypes • {tier.supplyShare}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{tier.desc}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs font-mono">
                <span className="text-slate-400">Base Yield: 100,000 $NUN</span>
                <span
                  className={
                    tier.bonus > 0 ? "text-amber-300 font-bold" : "text-slate-500"
                  }
                >
                  {tier.bonus > 0
                    ? `+${tier.bonus.toLocaleString()} Bonus`
                    : "Standard Tier"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveRarityFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                activeRarityFilter === "all"
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              All (72)
            </button>
            {RARITY_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setActiveRarityFilter(tier.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                  activeRarityFilter === tier.id
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {tier.label} ({tier.count})
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, animal, alien trait..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* 72 NFT Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {filteredNfts.map((nft) => {
            const tierObj = RARITY_TIERS.find((r) => r.id === nft.rarity);
            return (
              <div
                key={nft.id}
                onClick={() => setSelectedNft(nft)}
                className={`group cursor-pointer rounded-2xl bg-slate-900/80 border ${
                  tierObj?.border || "border-slate-800"
                } p-2.5 hover:-translate-y-1 hover:border-cyan-400/70 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 border border-slate-800">
                    <PixelArtCharacterSVG nft={nft} size="sm" />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/85 text-[10px] font-mono text-slate-300">
                      #{String(nft.id).padStart(2, "0")}
                    </span>
                    <span
                      className={`absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${tierObj?.badge}`}
                    >
                      {nft.rarity}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-cyan-300">
                    {nft.name}
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-0.5 text-[10px] text-slate-400">
                  <p className="truncate">
                    <span className="text-slate-500">H:</span> {nft.human}
                  </p>
                  <p className="truncate">
                    <span className="text-emerald-400">A:</span> {nft.animal}
                  </p>
                  <p className="truncate">
                    <span className="text-amber-400">X:</span> {nft.alien}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          SECTION 3: FUTURE ($NUN ECOSYSTEM & BONUS REWARDS)
      ========================================== */}
      <section
        id="future"
        className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: $NUN Token Allocation & Rarity Bonus Table */}
          <div className="lg:col-span-7 space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-wider">
              Future Ecosystem & Holder Yield
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              100,000 <span className="text-amber-400">$NUN</span> GUARANTEED PER NFT + RARITY
              BONUSES
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every ANUNAKI Genesis NFT acts as an immutable vault key for the upcoming{" "}
              <strong className="text-amber-300">$NUN</strong> ecosystem distribution. Regardless
              of rarity, every single NFT held entitles its owner to a base claim of{" "}
              <strong className="text-white">100,000 $NUN</strong>. Holders of{" "}
              <strong className="text-cyan-300">Rare</strong> archetypes and higher unlock
              additional tiered bonus tokens per NFT:
            </p>

            {/* Rarity Bonus Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-mono uppercase text-slate-400">
                    <th className="py-3.5 px-4">Rarity Tier</th>
                    <th className="py-3.5 px-4">Base Allocation</th>
                    <th className="py-3.5 px-4">Rarity Bonus</th>
                    <th className="py-3.5 px-4 text-right">Total per NFT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs sm:text-sm">
                  {RARITY_TIERS.map((tier) => (
                    <tr key={tier.id} className="hover:bg-slate-800/40">
                      <td className={`py-3.5 px-4 font-bold uppercase ${tier.color}`}>
                        {tier.label}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">100,000 $NUN</td>
                      <td className="py-3.5 px-4 font-mono">
                        {tier.bonus > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30 font-bold">
                            +{tier.bonus.toLocaleString()} $NUN
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-right text-white">
                        {(100000 + tier.bonus).toLocaleString()} $NUN
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Interactive $NUN Yield Simulator */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">Holder Yield Simulator</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {nunCalculation.totalNfts} NFT(s) Selected
              </span>
            </div>

            <div className="space-y-3">
              {RARITY_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
                >
                  <div>
                    <span className={`text-xs font-bold uppercase ${tier.color}`}>
                      {tier.label}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-400">
                      {(100000 + tier.bonus).toLocaleString()} $NUN / NFT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCalcCount(tier.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono text-sm font-bold">
                      {calcCounts[tier.id]}
                    </span>
                    <button
                      onClick={() => updateCalcCount(tier.id, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-950 to-cyan-500/15 border border-amber-400/40 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Base Allocation ({nunCalculation.totalNfts} × 100k):</span>
                <span className="font-mono">{nunCalculation.baseTokens.toLocaleString()} $NUN</span>
              </div>
              <div className="flex justify-between text-xs text-amber-300">
                <span>Rarity Tier Bonus:</span>
                <span className="font-mono">
                  +{nunCalculation.bonusTokens.toLocaleString()} $NUN
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase text-white">Total Claimable:</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {nunCalculation.grandTotal.toLocaleString()} $NUN
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 4: RULES (EXPONENTIAL MINT SCHEDULE & AGENTIC PROTOCOL)
      ========================================== */}
      <section
        id="rules"
        className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80"
      >
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-wider">
            On-Chain Smart Contract Enforcement
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            MINTING RULES & DYNAMIC PRICING
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every holder of a valid <strong className="text-white">Binance Agentic ID</strong> can
            claim their first ANUNAKI NFT for <strong className="text-emerald-400">FREE</strong>.
            Subsequent claims automatically follow an on-chain{" "}
            <strong className="text-amber-300">x2 multiplier</strong> up to a strict maximum of 5
            NFTs per wallet. All network gas fees are paid by the user.
          </p>
        </div>

        {/* 5-Mint Tier Schedule Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            {
              mintNumber: "1st Mint",
              price: "FREE",
              sub: "0.0000 BNB + Gas",
              multiplier: "Agentic ID Perk",
              accent: "border-emerald-500/50 bg-emerald-950/20 text-emerald-300",
            },
            {
              mintNumber: "2nd Mint",
              price: "0.0012 BNB",
              sub: "+ Network Gas",
              multiplier: "Base Paid Tier",
              accent: "border-cyan-500/40 bg-slate-900/80 text-cyan-300",
            },
            {
              mintNumber: "3rd Mint",
              price: "0.0024 BNB",
              sub: "+ Network Gas",
              multiplier: "2x Multiplier",
              accent: "border-purple-500/40 bg-slate-900/80 text-purple-300",
            },
            {
              mintNumber: "4th Mint",
              price: "0.0048 BNB",
              sub: "+ Network Gas",
              multiplier: "2x Multiplier",
              accent: "border-rose-500/40 bg-slate-900/80 text-rose-300",
            },
            {
              mintNumber: "5th Mint (Max)",
              price: "0.0096 BNB",
              sub: "+ Network Gas",
              multiplier: "2x Hard Cap",
              accent: "border-amber-500/60 bg-amber-950/20 text-amber-300",
            },
          ].map((slot, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${slot.accent} flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">
                  {slot.mintNumber}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {slot.multiplier}
                </span>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-white">{slot.price}</p>
                <p className="text-xs text-slate-400 mt-0.5">{slot.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Protocol Rules Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Automated Balance Evaluation</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              When you paste the mint prompt into your Agentic Wallet, your AI Agent automatically
              checks your BNB balance and on-chain mint count, then renders{" "}
              <strong className="text-white">[Mint All]</strong> (mints the max NFTs your balance
              covers) and <strong className="text-white">[Mint 1]</strong>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              2. Contract-Level Price Enforcement
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pricing is enforced directly by the smart contract per wallet address. Even if a
              wallet interacts outside the prompt, the 2nd mint automatically costs{" "}
              <strong className="text-white">0.0012 BNB</strong>, doubling on each subsequent mint
              up to 5 NFTs maximum.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Full 5-NFT Cumulative Cost</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Claiming the full allowance of 5 NFTs in a single wallet totals{" "}
              <strong className="text-amber-300">0.0180 BNB</strong> (0 + 0.0012 + 0.0024 + 0.0048
              + 0.0096 BNB) plus standard BNB Smart Chain gas fees borne by the user.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 5: FAQ (COMPLETE PROJECT SUMMARY)
      ========================================== */}
      <section
        id="faq"
        className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/80"
      >
        <div className="text-center space-y-4 mb-12">
          <span className="px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono uppercase tracking-wider">
            Executive Project Summary & FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            COMPLETE PROTOCOL SPECIFICATION
          </h2>
        </div>

        {/* Executive Summary Specification List */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 mb-10 space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span>End-to-End Project Blueprint</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-xs">Project Name & Theme</span>
              <strong className="text-white">
                ANUNAKI — 2D Pixel Human-Animal-Alien Hybrid Collectible
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-xs">Total Supply & Mechanism</span>
              <strong className="text-cyan-300">
                30,000 NFTs Hard Cap • First-Come, First-Served (FCFS)
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-xs">72 Archetype Distribution</span>
              <strong className="text-white">
                Common (24), Uncommon (18), Rare (12), Ascended (9), Ethernal (6), Apex (3)
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-xs">Holder Token Benefit ($NUN)</span>
              <strong className="text-amber-300">
                100,000 $NUN Base / NFT + 3,000 to 15,000 $NUN Rarity Bonus (Rare+)
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-xs">Mint Price Progression</span>
              <strong className="text-emerald-300">
                1st Free (Agentic ID) • 2nd: 0.0012 BNB • x2 per subsequent mint (Max 5)
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-xs">Agent Execution Mode</span>
              <strong className="text-white">
                Auto-detects wallet balance & displays [Mint All] and [Mint 1]
              </strong>
            </div>
          </div>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-white">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">ANUNAKI PROTOCOL</span>
            <span>• Binance Web3 Agentic Wallet Event</span>
          </div>
          <p>© 2026 ANUNAKI Genesis. All rights reserved.</p>
        </div>
      </footer>

      {/* ==========================================
          MODAL 1: AGENTIC WALLET MINT PROMPT GENERATOR
      ========================================== */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Agentic Wallet Execution Prompt
                  </h3>
                  <p className="text-xs text-slate-400">
                    Copy and paste this command into your Binance Web3 Agentic AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Code Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 whitespace-pre-wrap leading-relaxed select-all">
              {agenticMintPrompt}
            </div>

            {/* Simulated Preview of What the User's Agent Will Display */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Agent Response Preview (Inside Your Binance Agentic Wallet):</span>
              </div>
              <p className="text-xs text-slate-400">
                Once pasted, your Agent automatically calculates your {NETWORK_CONFIG.symbol}{" "}
                balance & current tier, then displays two direct execution buttons:
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-xs font-bold">
                  [Mint All] — Auto-mints max affordable NFTs (1–5)
                </span>
                <span className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold">
                  [Mint 1] — Mints 1 NFT at current tier price
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleCopyPrompt}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>PROMPT COPIED TO CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY AGENTIC PROMPT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: ARCHETYPE DNA INSPECTOR
      ========================================== */}
      {selectedNft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          onClick={() => setSelectedNft(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400">
                  ARCHETYPE #{String(selectedNft.id).padStart(2, "0")} / 72
                </span>
                <h3 className="text-xl font-black text-white">{selectedNft.name}</h3>
              </div>
              <button
                onClick={() => setSelectedNft(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-800">
              <PixelArtCharacterSVG nft={selectedNft} size="lg" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Rarity Tier:</span>
                <span className="font-bold uppercase text-cyan-300">{selectedNft.rarity}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Human Operative Class:</span>
                <span className="font-bold text-white">{selectedNft.human}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Animal Genetic Splice:</span>
                <span className="font-bold text-emerald-300">{selectedNft.animal}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Alien Augmentation:</span>
                <span className="font-bold text-amber-300">{selectedNft.alien}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedNft(null);
                setIsPromptModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm"
            >
              MINT THIS COLLECTION NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}