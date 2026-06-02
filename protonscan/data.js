// ─── Config ──────────────────────────────────────────────────────────────────
// When deploying to GitHub Pages, change apiBase to your backend URL.
// e.g. "https://api.proton.m1k0.de"
window.PROTON_CONFIG = {
  apiBase: "http://localhost:8000",
};

// ─── Tier definitions ─────────────────────────────────────────────────────────
window.TIERS = {
  native:   { label: "Native",   color: "#5dd98a", bg: "rgba(93,217,138,0.12)",  icon: "🐧", desc: "Has native Linux support — no Proton needed." },
  platinum: { label: "Platinum", color: "#a8c8e8", bg: "rgba(168,200,232,0.12)", icon: "✦",  desc: "Works perfectly out of the box via Proton." },
  gold:     { label: "Gold",     color: "#f0c040", bg: "rgba(240,192,64,0.12)",  icon: "★",  desc: "Works great after minor tweaks." },
  silver:   { label: "Silver",   color: "#b8a898", bg: "rgba(184,168,152,0.12)", icon: "◆",  desc: "Runs with minor issues, generally playable." },
  bronze:   { label: "Bronze",   color: "#c87840", bg: "rgba(200,120,64,0.12)",  icon: "◈",  desc: "Runs but has notable issues." },
  borked:   { label: "Borked",   color: "#e05555", bg: "rgba(224,85,85,0.12)",   icon: "✕",  desc: "Does not run or is completely broken." },
  unknown:  { label: "Unknown",  color: "#7a6050", bg: "rgba(122,96,80,0.12)",   icon: "?",  desc: "No ProtonDB data available." },
};
