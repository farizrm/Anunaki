const fs = require("fs");
const path = require("path");

const IMAGE_FOLDER_CID = "bafybeifihc2whtdr7i6sgo3mjkakidpfouotfmsjbbp4u7pbfr22qi6lbe";

// Data 72 Archetype persis seperti di website kamu
const ARCHETYPES = [
  { name: "Anu-Prime Enlil", rarity: "Apex", human: "Sovereign King", animal: "Golden Winged Lion", alien: "Nibiru Solar Crown" },
  { name: "Enki Voidweaver", rarity: "Apex", human: "High Architect", animal: "Abyssal Leviathan", alien: "Quantum Mind-Tendrils" },
  { name: "Tiamat Star-Eater", rarity: "Apex", human: "Valkyrie Empress", animal: "Celestial Hydra", alien: "Nova Singularity Core" },
  { name: "Marduk Solaris", rarity: "Ethernal", human: "Solar Praetorian", animal: "Phoenix Falcon", alien: "Photonic Halo Array" },
  { name: "Inanna Starlight", rarity: "Ethernal", human: "High Priestess", animal: "Snow Leopard", alien: "Nebula Third-Eye" },
  { name: "Nergal AbyssWalker", rarity: "Ethernal", human: "Shadow Warlord", animal: "Obsidian Direwolf", alien: "Antimatter Exoskeleton" },
  { name: "Ninurta ThunderClaw", rarity: "Ethernal", human: "Storm Paladin", animal: "Sabertooth Tiger", alien: "Arc-Plasma Gauntlets" },
  { name: "Ereshkigal Veil", rarity: "Ethernal", human: "Necro-Siren", animal: "King Cobra", alien: "Void Frequency Horns" },
  { name: "Dumuzid Aetherius", rarity: "Ethernal", human: "Chrono Shepherd", animal: "Astral Stag", alien: "Crystalline Cranium" },
  { name: "Utu Dawnbringer", rarity: "Ascended", human: "Cyber Templar", animal: "Golden Eagle", alien: "Helios Laser Visor" },
  { name: "Nanna Moonstalker", rarity: "Ascended", human: "Silent Shinobi", animal: "Silver Panther", alien: "Lunar Gravity Orbs" },
  { name: "Ishkur Tempest", rarity: "Ascended", human: "Valkyrie Striker", animal: "Thunder Roc", alien: "Ionized Wing-Matrix" },
  { name: "Ninhursag Bio-Queen", rarity: "Ascended", human: "Genetic Savant", animal: "Emerald Mantis", alien: "Spore-Link Antennae" },
  { name: "Gibil Flameheart", rarity: "Ascended", human: "Forge Master", animal: "Komodo Dragon", alien: "Thermonuclear Carapace" },
  { name: "Nisaba Code-Scribe", rarity: "Ascended", human: "Neural Oracle", animal: "Barn Owl", alien: "Holographic Synapse Crown" },
  { name: "Nabu Logic-Prime", rarity: "Ascended", human: "Grand Strategist", animal: "Arctic Fox", alien: "Tachyon Optical Tri-Lens" },
  { name: "Bau Life-Weaver", rarity: "Ascended", human: "Bio-Medic Commander", animal: "White Crane", alien: "Nanite Regeneration Halo" },
  { name: "Pazuzu Wind-Reaver", rarity: "Ascended", human: "Sky Corsair", animal: "Harpy Eagle", alien: "Sonic Vortex Talons" },
  { name: "Gilga-Vanguard", rarity: "Rare", human: "Heavy Centurion", animal: "Silverback Gorilla", alien: "Graviton Shoulder Pods" },
  { name: "Enkidu Wild-Core", rarity: "Rare", human: "Brawler Berserker", animal: "Bison Bull", alien: "Emerald Horn Implants" },
  { name: "Shamash Ray-Gunner", rarity: "Rare", human: "Orbital Marksman", animal: "Peregrine Falcon", alien: "Photon Targeter Eye" },
  { name: "Ishtar Pulse-Blade", rarity: "Rare", human: "Dual-Blade Duelist", animal: "Cheetah", alien: "Neon Reflex Condenser" },
  { name: "Assur Iron-Fang", rarity: "Rare", human: "Siege Breacher", animal: "Kodiak Bear", alien: "Plasma Jaw-Clamp" },
  { name: "Sin Night-Watcher", rarity: "Rare", human: "Recon Ghost", animal: "Vampire Bat", alien: "Sonar Crest Receptor" },
  { name: "Adad Cloud-Splitter", rarity: "Rare", human: "Shock Trooper", animal: "Electric Eel", alien: "Volt-Coil Spine" },
  { name: "Dagon Deep-Diver", rarity: "Rare", human: "Trench Marine", animal: "Great White Shark", alien: "Hydro-Gill Cybernetics" },
  { name: "Tammuz Cyber-Hound", rarity: "Rare", human: "Tracker Operative", animal: "Doberman Alpha", alien: "Infrared Snout Array" },
  { name: "Asherah Star-Root", rarity: "Rare", human: "Botanic Druid", animal: "Chameleon", alien: "Prism Camo Skin" },
  { name: "Mot Grim-Harvester", rarity: "Rare", human: "Reaper Executioner", animal: "Black Vulture", alien: "Entropy Scythe Arm" },
  { name: "Anat War-Maiden", rarity: "Rare", human: "Shield Maiden", animal: "Wolverine", alien: "Adamantine Bone-Spurs" },
  { name: "Kingu Viper-Unit", rarity: "Uncommon", human: "Infiltrator", animal: "Pit Viper", alien: "Acid-Spit Mandibles" },
  { name: "Lahmu Silt-Strider", rarity: "Uncommon", human: "Desert Ranger", animal: "Scorpion", alien: "Chitin Tail Stinger" },
  { name: "Kishar Horizon-Scout", rarity: "Uncommon", human: "Outrider", animal: "Gazelle", alien: "Hyper-Stride Tendons" },
  { name: "Anshar Sky-Sentry", rarity: "Uncommon", human: "Jetpack Trooper", animal: "Albatross", alien: "Aero-Glide Membrane" },
  { name: "Mummu Mist-Technic", rarity: "Uncommon", human: "Cryo Engineer", animal: "Polar Bear", alien: "Frost-Core Respirator" },
  { name: "Lugalbanda Swift-Foot", rarity: "Uncommon", human: "Courier Runner", animal: "Jackrabbit", alien: "Kinetic Ankle Thrusters" },
  { name: "Ninsun Oracle-Guard", rarity: "Uncommon", human: "Temple Sentinel", animal: "Ibex Ram", alien: "Psionic Horn Resonator" },
  { name: "Geshtinanna Vine-Whip", rarity: "Uncommon", human: "Cyber Hacker", animal: "Tree Frog", alien: "Bio-Luminescent Fingers" },
  { name: "Ningishzida Twin-Coils", rarity: "Uncommon", human: "Field Medic", animal: "Coral Snake", alien: "Caduceus Drone Link" },
  { name: "Shara Bow-Stalker", rarity: "Uncommon", human: "Compound Archer", animal: "Lynx", alien: "Hawkeye Stabilizer" },
  { name: "Zababa Pike-Breaker", rarity: "Uncommon", human: "Frontline Lancer", animal: "Black Rhino", alien: "Kinetic Impact Horn" },
  { name: "Nanshe Tide-Seer", rarity: "Uncommon", human: "Sonar Navigator", animal: "Dolphin", alien: "Echo-Dome Forehead" },
  { name: "Ninazu Venom-Doc", rarity: "Uncommon", human: "Toxin Chemist", animal: "Gila Monster", alien: "Venom-Gland Gauntlet" },
  { name: "Enbilulu Canal-Guard", rarity: "Uncommon", human: "Heavy Gunner", animal: "Hippopotamus", alien: "Hydraulic Jaw Armor" },
  { name: "Sirara Reef-Stalker", rarity: "Uncommon", human: "Sub-Aqua Saboteur", animal: "Moray Eel", alien: "Biolight Dorsal Fin" },
  { name: "Ishhara Oath-Keeper", rarity: "Uncommon", human: "Arbiter Enforcer", animal: "Deathstalker Scorpion", alien: "Truth-Scan Ocular" },
  { name: "Ninkasi Brew-Alchemist", rarity: "Uncommon", human: "Stim-Synthesizer", animal: "Honey Badger", alien: "Adrenaline Injector Back" },
  { name: "Nusku Ember-Scout", rarity: "Uncommon", human: "Pyro Vanguard", animal: "Fire Salamander", alien: "Thermal Vision Crest" },
  { name: "Igigi Grunt-01", rarity: "Common", human: "Mining Trooper", animal: "Mole Rat", alien: "Drill-Claw Prosthetic" },
  { name: "Igigi Watcher-02", rarity: "Common", human: "Perimeter Guard", animal: "Meerkat", alien: "Periscope Optic Node" },
  { name: "Ziusudra Ark-Hand", rarity: "Common", human: "Hull Welder", animal: "Beaver", alien: "Plasma Torch Forearm" },
  { name: "Atrahasis Clay-Born", rarity: "Common", human: "Infantry Recruit", animal: "Wild Boar", alien: "Tusk-Plate Respirator" },
  { name: "Etana Eagle-Rider", rarity: "Common", human: "Drop-Pod Pilot", animal: "Kestrel", alien: "G-Force Neural Plug" },
  { name: "Adapa Reef-Fisher", rarity: "Common", human: "Harpoon Gunner", animal: "Barracuda", alien: "Scale-Mesh Vest" },
  { name: "Enmerkar Wall-Builder", rarity: "Common", human: "Fortress Mason", animal: "Armadillo", alien: "Plasteel Shell Pack" },
  { name: "ensuhgiranna Runner", rarity: "Common", human: "Signal Relay", animal: "Greyhound", alien: "Sub-Space Radio Ear" },
  { name: "Aruru Clay-Shaper", rarity: "Common", human: "Drone Mechanic", animal: "Weaver Ant", alien: "Multi-Tool Mandibles" },
  { name: "Nammu Salt-Diver", rarity: "Common", human: "Salvage Diver", animal: "Sea Turtle", alien: "O2 Rebreather Carapace" },
  { name: "Utnapishtim Survivor", rarity: "Common", human: "Wasteland Nomad", animal: "Camel", alien: "Rad-Filter Hump Module" },
  { name: "Siduri Tavern-AI", rarity: "Common", human: "Info Broker", animal: "Raven", alien: "Voice-Mimic Larynx" },
  { name: "Urshanabi Ferryman", rarity: "Common", human: "Warp-Barge Pilot", animal: "Hammerhead Shark", alien: "Wide-Angle Nav-Eyes" },
  { name: "Humbaba Cedar-Guard", rarity: "Common", human: "Forest Warden", animal: "Grizzly", alien: "Bark-Skin Subdermal" },
  { name: "Gugalanna Bull-Drone", rarity: "Common", human: "Riot Enforcer", animal: "Water Buffalo", alien: "Stun-Baton Horns" },
  { name: "Asag Rock-Biter", rarity: "Common", human: "Tunnel Blaster", animal: "Snapping Turtle", alien: "Seismic Jaw Sensor" },
  { name: "Sharur Mace-Bearer", rarity: "Common", human: "Shock Infantry", animal: "Pachycephalosaurus", alien: "Reinforced Cranium Dome" },
  { name: "Anzu Feather-Thief", rarity: "Common", human: "Loot Scavenger", animal: "Magpie", alien: "Magnetic Talon Grip" },
  { name: "kur-Dragon Hatchling", rarity: "Common", human: "Flamethrower Unit", animal: "Horned Lizard", alien: "Napalm Sac Throat" },
  { name: "Alalu Exiled-Scout", rarity: "Common", human: "Dune Patrol", animal: "Fennec Fox", alien: "Wide-Dish Audio Ears" },
  { name: "ki-Earth Trenchman", rarity: "Common", human: "Sapper Engineer", animal: "Badger", alien: "Trench-Claw Gloves" },
  { name: "Gula Pulse-Medic", rarity: "Common", human: "Combat Orderly", animal: "St. Bernard Hound", alien: "Defib-Pad Palms" },
  { name: "Damu Sap-Collector", rarity: "Common", human: "Bio-Harvester", animal: "Hummingbird", alien: "Siphon-Needle Mask" },
  { name: "irra Plague-Sentry", rarity: "Common", human: "Hazmat Trooper", animal: "Crow", alien: "Beak-Filter Gas Mask" }
];

const outDir = path.join(__dirname, "metadata");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

ARCHETYPES.forEach((item, index) => {
  const id = index + 1;
  const metadata = {
    name: `ANUNAKI #${id} — ${item.name}`,
    description: "ANUNAKI Genesis Triad: 2D Pixel Human-Animal-Alien Hybrid Collectible forged for the Binance Web3 Agentic Wallet Event.",
    image: `ipfs://${IMAGE_FOLDER_CID}/${id}.png`,
    attributes: [
      { trait_type: "Rarity Tier", value: item.rarity },
      { trait_type: "Human Operative", value: item.human },
      { trait_type: "Animal Instinct", value: item.animal },
      { trait_type: "Alien Cybernetic", value: item.alien }
    ]
  };
  fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(metadata, null, 2));
});

console.log("Berhasil membuat 72 file JSON di dalam folder /metadata!");