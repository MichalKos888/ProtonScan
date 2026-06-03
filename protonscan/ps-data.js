// ─── Tier definitions ─────────────────────────────────────────────────────────
// ps-app.jsx reads TT[tier].label and TT[tier].desc from this object.
window.TIERS = {
  native:   { label: "Native",   desc: "Has native Linux support — no Proton needed." },
  platinum: { label: "Platinum", desc: "Works perfectly out of the box via Proton." },
  gold:     { label: "Gold",     desc: "Runs great after a small tweak or two." },
  silver:   { label: "Silver",   desc: "Playable, with some rough edges." },
  bronze:   { label: "Bronze",   desc: "Runs but expect notable issues." },
  borked:   { label: "Borked",   desc: "Won't run — usually anti-cheat blocked." },
  unknown:  { label: "Unknown",  desc: "No ProtonDB reports yet." },
};

// Display order for tiers (used by sortByTier and the stats bar)
window.TIER_ORDER = ["native", "platinum", "gold", "silver", "bronze", "borked", "unknown"];

// ─── API config ───────────────────────────────────────────────────────────────
// Change apiBase to your deployed Cloudflare Worker URL.
window.PROTON_CONFIG = {
  apiBase: "https://proton-portal-api.michal070205.workers.dev",
};
