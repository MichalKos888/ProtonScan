// ─── ProtonScan mock data ──────────────────────────────────────────────────
// Real Steam App IDs so cover art loads from the public Steam CDN.
// (The live app fetches this from the FastAPI backend; mocked here for design.)

// ─── Backend config ─────────────────────────────────────────────────────────
// When deploying the frontend (e.g. GitHub Pages), point apiBase at your
// deployed FastAPI backend, e.g. "https://api.yourdomain.com".
window.PROTON_CONFIG = {
  apiBase: "http://localhost:8000",
};

// tier order matters for sorting / distribution bar
window.TIER_ORDER = ["native", "platinum", "gold", "silver", "bronze", "borked", "unknown"];

window.TIERS = {
  native:   { label: "Native",   desc: "Has native Linux support — no Proton needed." },
  platinum: { label: "Platinum", desc: "Runs flawlessly out of the box via Proton." },
  gold:     { label: "Gold",     desc: "Runs great after a small tweak or two." },
  silver:   { label: "Silver",   desc: "Playable, with minor rough edges." },
  bronze:   { label: "Bronze",   desc: "Runs, but expect notable issues." },
  borked:   { label: "Borked",   desc: "Won't run — usually anti-cheat blocked." },
  unknown:  { label: "Unknown",  desc: "No ProtonDB reports yet." },
};

// id = real Steam appid · pt = your playtime (minutes) · rep = ProtonDB report count
window.PS_GAMES = [
  { id: 413150,  name: "Stardew Valley",            tier: "native",   pt: 8420, rep: 4120, antiCheat: false },
  { id: 367520,  name: "Hollow Knight",             tier: "native",   pt: 3110, rep: 3680, antiCheat: false },
  { id: 504230,  name: "Celeste",                   tier: "native",   pt: 1490, rep: 1980, antiCheat: false },
  { id: 105600,  name: "Terraria",                  tier: "native",   pt: 6230, rep: 3450, antiCheat: false },
  { id: 588650,  name: "Dead Cells",                tier: "native",   pt: 940,  rep: 1610, antiCheat: false },
  { id: 570,     name: "Dota 2",                     tier: "native",   pt: 12010,rep: 5210, antiCheat: false },

  { id: 1086940, name: "Baldur's Gate 3",           tier: "platinum", pt: 7200, rep: 9120, antiCheat: false },
  { id: 292030,  name: "The Witcher 3",             tier: "platinum", pt: 5400, rep: 7340, antiCheat: false },
  { id: 548430,  name: "Deep Rock Galactic",        tier: "platinum", pt: 2210, rep: 2890, antiCheat: false },
  { id: 268910,  name: "Cuphead",                   tier: "platinum", pt: 610,  rep: 1240, antiCheat: false },
  { id: 945360,  name: "Among Us",                  tier: "platinum", pt: 380,  rep: 980,  antiCheat: false },

  { id: 1245620, name: "ELDEN RING",                tier: "gold",     pt: 4180, rep: 8650, antiCheat: true  },
  { id: 1091500, name: "Cyberpunk 2077",            tier: "gold",     pt: 3320, rep: 6710, antiCheat: false },
  { id: 1174180, name: "Red Dead Redemption 2",     tier: "gold",     pt: 2870, rep: 5980, antiCheat: false },
  { id: 374320,  name: "DARK SOULS III",            tier: "gold",     pt: 1620, rep: 3210, antiCheat: true  },
  { id: 489830,  name: "Skyrim Special Edition",    tier: "gold",     pt: 4410, rep: 4870, antiCheat: false },
  { id: 1593500, name: "God of War",                tier: "gold",     pt: 1180, rep: 2640, antiCheat: false },
  { id: 252490,  name: "Rust",                      tier: "gold",     pt: 2090, rep: 3110, antiCheat: true  },
  { id: 990080,  name: "Hogwarts Legacy",           tier: "gold",     pt: 760,  rep: 2210, antiCheat: false },

  { id: 1203220, name: "NARAKA: BLADEPOINT",        tier: "silver",   pt: 410,  rep: 1180, antiCheat: true  },
  { id: 1716740, name: "Starfield",                 tier: "silver",   pt: 520,  rep: 1940, antiCheat: false },
  { id: 524220,  name: "NieR: Automata",            tier: "silver",   pt: 690,  rep: 1520, antiCheat: false },

  { id: 814380,  name: "Sekiro: Shadows Die Twice", tier: "bronze",   pt: 340,  rep: 1670, antiCheat: false },
  { id: 230410,  name: "Warframe",                  tier: "bronze",   pt: 1810, rep: 2230, antiCheat: false },

  { id: 1172470, name: "Apex Legends",              tier: "borked",   pt: 1240, rep: 4310, antiCheat: true  },
  { id: 1938090, name: "Call of Duty",              tier: "borked",   pt: 880,  rep: 3920, antiCheat: true  },
  { id: 1517290, name: "Battlefield 2042",          tier: "borked",   pt: 210,  rep: 1450, antiCheat: true  },
  { id: 1599340, name: "Lost Ark",                  tier: "borked",   pt: 460,  rep: 1830, antiCheat: true  },
];
