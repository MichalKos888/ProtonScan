// protonscan/ps-app.jsx — cozy redesign of ProtonScan
// Themeable. No emoji — all glyphs are inline SVG. Exports window.ProtonScan + window.PS_THEMES.
// Globals: React, ReactDOM, TIERS, TIER_ORDER, PS_GAMES (ps-data.js)

const { useState, useMemo, useRef, useEffect, createContext, useContext } = React;
const TT  = window.TIERS;
const TORD = window.TIER_ORDER;
const GAMES = window.PS_GAMES;

// ─── Clear, cozy tier palette (warm-harmonised, reads well on dark) ──────────
const TIER_COLOR = {
  native:   "#86c08c",  // fresh sage
  platinum: "#9fbce0",  // soft periwinkle
  gold:     "#e6bb66",  // warm honey
  silver:   "#c2b3a1",  // pale stone
  bronze:   "#cf8f63",  // toasted clay
  borked:   "#d97b71",  // muted brick
  unknown:  "#9a8b7a",  // taupe
};

// ─── Themes ──────────────────────────────────────────────────────────────────
// All warm taupe / coffee, lifted off near-black, soft coral accent, humanist sans.
const PS_THEMES = {
  latte: {
    label: "Latte",
    blurb: "Lightest & airiest — barely-dark, creamy raised cards.",
    font: "'Figtree', sans-serif",
    bg: "#37312b", panel: "#403930", panel2: "#4a4239", raised: "#473f36",
    border: "#564d42", borderSoft: "#4a4239",
    text: "#f4ece0", textDim: "#c3b4a1", textMuted: "#9a8a76",
    accent: "#e69370", accentInk: "#2a211a", accentSoft: "rgba(230,147,112,0.16)",
    good: "#86c08c",
    radius: 18, gap: 22, shadow: "0 6px 22px rgba(0,0,0,0.28)", glow: false,
    tuxBody: "#2c241d", tuxBelly: "#f6efe2", tuxBeak: "#eaab5e",
  },
  hearth: {
    label: "Hearth",
    blurb: "The cozy middle — warm taupe living-room glow, soft coral.",
    font: "'Hanken Grotesk', sans-serif",
    bg: "#2a2520", panel: "#332e27", panel2: "#3c362e", raised: "#39332b",
    border: "#48413a", borderSoft: "#3c362e",
    text: "#efe6d9", textDim: "#bbab97", textMuted: "#8c7c6a",
    accent: "#e3885f", accentInk: "#241c15", accentSoft: "rgba(227,136,95,0.15)",
    good: "#86c08c",
    radius: 16, gap: 20, shadow: "0 8px 26px rgba(0,0,0,0.4)", glow: false,
    tuxBody: "#241d17", tuxBelly: "#f3ead9", tuxBeak: "#e8a85c",
  },
  ember: {
    label: "Ember",
    blurb: "Deepest & moodiest — cocoa dusk, coral glow, a touch of mono.",
    font: "'Hanken Grotesk', sans-serif",
    mono: "'Space Mono', monospace",
    bg: "#211b16", panel: "#2b241e", panel2: "#342c24", raised: "#312921",
    border: "#42382e", borderSoft: "#342c24",
    text: "#eee2d2", textDim: "#b6a48e", textMuted: "#7e6e5d",
    accent: "#e98a5d", accentInk: "#1f160f", accentSoft: "rgba(233,138,93,0.16)",
    good: "#8ec894",
    radius: 14, gap: 18, shadow: "0 10px 30px rgba(0,0,0,0.5)", glow: true,
    tuxBody: "#1c150f", tuxBelly: "#f0e5d3", tuxBeak: "#ec9a4f",
  },
};

const ThemeCtx = createContext(PS_THEMES.hearth);
const useTheme = () => useContext(ThemeCtx);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const pdbUrl = id => `https://www.protondb.com/app/${id}`;
const steamImg = id => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;
const fmtHrs = m => { const h = Math.round(m / 60); return h < 1 ? "<1h" : `${h.toLocaleString()}h`; };
const fmtNum = n => n > 0 ? n.toLocaleString() : "—";

// ═══ ICONS — all SVG, no emoji ════════════════════════════════════════════════

// Friendly Tux mascot
function Tux({ size = 30 }) {
  const t = useTheme();
  return (
    <svg width={size} height={size * 72 / 64} viewBox="0 0 64 72" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <ellipse cx="23" cy="66" rx="9.5" ry="5" fill={t.tuxBeak} />
      <ellipse cx="41" cy="66" rx="9.5" ry="5" fill={t.tuxBeak} />
      <path d="M32 3 C18.5 3 13 17 13 37 C13 57 21 67 32 67 C43 67 51 57 51 37 C51 17 45.5 3 32 3 Z" fill={t.tuxBody} />
      {/* flippers */}
      <path d="M14 33 C7 37 7 50 13 54 C15 50 15 40 16 35 Z" fill={t.tuxBody} />
      <path d="M50 33 C57 37 57 50 51 54 C49 50 49 40 48 35 Z" fill={t.tuxBody} />
      {/* belly */}
      <path d="M32 21 C23 21 18 30 18 44 C18 56 24 64 32 64 C40 64 46 56 46 44 C46 30 41 21 32 21 Z" fill={t.tuxBelly} />
      {/* eyes */}
      <ellipse cx="26.5" cy="25" rx="5" ry="6.6" fill="#fbf7ef" />
      <ellipse cx="37.5" cy="25" rx="5" ry="6.6" fill="#fbf7ef" />
      <circle cx="27.6" cy="27" r="2.5" fill="#15100b" />
      <circle cx="36.4" cy="27" r="2.5" fill="#15100b" />
      {/* beak */}
      <path d="M32 28.5 L39 34 L32 39 L25 34 Z" fill={t.tuxBeak} />
      <path d="M32 34 L39 34 L32 39 Z" fill="#c9863f" opacity="0.55" />
    </svg>
  );
}

function TierIcon({ tier, size = 13, color }) {
  const c = color || TIER_COLOR[tier] || TIER_COLOR.unknown;
  const p = { width: size, height: size, viewBox: "0 0 16 16", style: { display: "block", flexShrink: 0 } };
  switch (tier) {
    case "native": // check
      return <svg {...p} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.3 3.3L13 4.5" /></svg>;
    case "platinum": // 4-point sparkle
      return <svg {...p} fill={c}><path d="M8 0.5 L9.6 6.4 L15.5 8 L9.6 9.6 L8 15.5 L6.4 9.6 L0.5 8 L6.4 6.4 Z" /></svg>;
    case "gold": // 5-point star
      return <svg {...p} fill={c}><path d="M8 1 L10 5.9 L15.3 6.3 L11.2 9.7 L12.5 14.9 L8 12 L3.5 14.9 L4.8 9.7 L0.7 6.3 L6 5.9 Z" /></svg>;
    case "silver": // diamond
      return <svg {...p} fill={c}><path d="M8 1.2 L14.8 8 L8 14.8 L1.2 8 Z" /></svg>;
    case "bronze": // hexagon
      return <svg {...p} fill={c}><path d="M8 1 L14 4.5 L14 11.5 L8 15 L2 11.5 L2 4.5 Z" /></svg>;
    case "borked": // x
      return <svg {...p} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>;
    default: // unknown — small ring
      return <svg {...p} fill="none" stroke={c} strokeWidth="2"><circle cx="8" cy="8" r="5" strokeDasharray="2.5 2.5" /></svg>;
  }
}

const LibIcon = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2.5" width="3.4" height="11" rx="1" /><rect x="6.3" y="2.5" width="3.4" height="11" rx="1" />
    <path d="M11 3.4l2.6 0.7 -2 9.6 -2.6 -0.6" />
  </svg>
);
const SearchIcon = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
  </svg>
);
const ExtIcon = ({ s = 13 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h4v4M13 3L7.5 8.5M11 9.5V13H3V5h3.5" />
  </svg>
);
const BoltIcon = ({ s = 12, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill={c}><path d="M9 1L3 9h4l-1 6 6-8H8z" /></svg>
);
const ShieldIcon = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M8 1.5l5 2v4c0 3.2-2.2 5.2-5 6.5C5.2 12.7 3 10.7 3 7.5v-4z" />
  </svg>
);

// ═══ COMPONENTS ═══════════════════════════════════════════════════════════════

function TierChip({ tier, small }) {
  const t = useTheme();
  const c = TIER_COLOR[tier];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: small ? 4 : 5,
      padding: small ? "2px 7px 2px 6px" : "3px 9px 3px 7px",
      borderRadius: 999, background: `${c}1f`, border: `1px solid ${c}40`,
      color: c, fontSize: small ? 10.5 : 11.5, fontWeight: 600, letterSpacing: 0.2, whiteSpace: "nowrap",
    }}>
      <TierIcon tier={tier} size={small ? 11 : 12} color={c} />
      {TT[tier].label}
    </span>
  );
}

function GameCard({ game }) {
  const t = useTheme();
  const [hov, setHov] = useState(false);
  const [err, setErr] = useState(false);
  const c = TIER_COLOR[game.tier];

  return (
    <a href={pdbUrl(game.id)} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "block", textDecoration: "none", background: t.raised,
        border: `1px solid ${hov ? c + "70" : t.border}`,
        borderRadius: t.radius, overflow: "hidden",
        transition: "border-color .22s, box-shadow .22s, transform .22s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `${t.shadow}, 0 0 0 1px ${c}30${t.glow ? `, 0 0 26px ${c}22` : ""}` : t.shadow,
        animation: "psUp .35s ease both",
      }}>
      <div style={{ position: "relative", paddingTop: "46.7%", background: t.panel2, overflow: "hidden" }}>
        {!err ? (
          <img src={steamImg(game.id)} alt={game.name} onError={() => setErr(true)}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              transition: "transform .4s, opacity .25s",
              transform: hov ? "scale(1.05)" : "none", opacity: hov ? 0.4 : 1,
            }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${t.panel2}, ${c}22)`, padding: "0 14px" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.textDim, textAlign: "center" }}>{game.name}</span>
          </div>
        )}

        {/* persistent tier badge */}
        <div style={{ position: "absolute", top: 10, right: 10, background: t.bg + "e6", borderRadius: 999, padding: "3px 9px 3px 7px", border: `1px solid ${c}55`, backdropFilter: "blur(4px)", display: "inline-flex", alignItems: "center", gap: 5 }}>
          <TierIcon tier={game.tier} size={11} color={c} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: c, letterSpacing: 0.3 }}>{TT[game.tier].label}</span>
        </div>

        {/* hover overlay */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "16px 16px 14px", gap: 6,
          background: `linear-gradient(to top, ${t.bg}f7 8%, ${t.bg}b0 48%, transparent 92%)`,
          opacity: hov ? 1 : 0, transition: "opacity .25s",
        }}>
          <div style={{ fontSize: 12.5, color: t.text, lineHeight: 1.45 }}>{TT[game.tier].desc}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 11.5, color: t.textDim, marginTop: 2 }}>
            <span>{fmtNum(game.rep)} reports</span>
            {game.pt > 0 && <span>{fmtHrs(game.pt)} played</span>}
          </div>
          {game.antiCheat && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: t.textDim, marginTop: 1 }}>
              <ShieldIcon s={12} /> Uses anti-cheat
            </div>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11.5, fontWeight: 700, color: t.accent, letterSpacing: 0.3 }}>
            Open on ProtonDB <ExtIcon s={12} />
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ flex: "1 1 auto", minWidth: 0, fontSize: 14, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{game.name}</span>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0, boxShadow: t.glow ? `0 0 7px ${c}` : "none" }} />
      </div>
    </a>
  );
}

function ModeToggle({ mode, onChange }) {
  const t = useTheme();
  const modes = [{ key: "library", label: "My Library", Icon: LibIcon }, { key: "search", label: "Search All", Icon: SearchIcon }];
  return (
    <div style={{ display: "flex", gap: 3, background: t.panel2, border: `1px solid ${t.borderSoft}`, borderRadius: 12, padding: 4 }}>
      {modes.map(({ key, label, Icon }) => {
        const active = mode === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 15px", borderRadius: 9, border: "none",
            background: active ? t.accent : "transparent", color: active ? t.accentInk : t.textDim,
            fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .16s",
          }}>
            <Icon s={15} /> {label}
          </button>
        );
      })}
    </div>
  );
}

// Cozy Tux tip beside the stats
function TuxTip({ playable, total }) {
  const t = useTheme();
  const pct = total ? Math.round(playable / total * 100) : 0;
  const msg = pct >= 80 ? "Your shelf loves Linux. Game on."
    : pct >= 55 ? "Most of your library runs great on Linux."
    : pct >= 30 ? "A solid chunk of your shelf is Linux-ready."
    : "A handful run great — check tiers before you buy.";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: t.panel, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: "14px 18px 14px 15px" }}>
      <Tux size={42} />
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, lineHeight: 1.3 }}>
          <span style={{ color: t.good, fontWeight: 700 }}>{pct}% playable</span> &mdash; {msg}
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>
          {playable} of {total} run on Native or Platinum/Gold Proton.
        </div>
      </div>
    </div>
  );
}

function StatsBar({ games, activeTier, onTierClick }) {
  const t = useTheme();
  const counts = useMemo(() => { const c = {}; games.forEach(g => c[g.tier] = (c[g.tier] || 0) + 1); return c; }, [games]);
  const playable = (counts.native || 0) + (counts.platinum || 0) + (counts.gold || 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(280px, 360px)", gap: 14, marginBottom: 18 }}>
      <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: t.text, lineHeight: 1 }}>{games.length}</span>
          <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 500 }}>games in library</span>
        </div>
        {/* distribution bar */}
        <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", marginBottom: 13, gap: 2 }}>
          {TORD.map(tier => {
            const p = ((counts[tier] || 0) / games.length) * 100;
            if (!p) return null;
            const dim = !(activeTier === "all" || activeTier === tier);
            return <div key={tier} title={`${TT[tier].label}: ${counts[tier]}`} onClick={() => onTierClick(tier === activeTier ? "all" : tier)}
              style={{ width: `${p}%`, background: TIER_COLOR[tier], opacity: dim ? 0.22 : 1, cursor: "pointer", transition: "opacity .2s" }} />;
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 8px" }}>
          {TORD.map(tier => {
            const n = counts[tier] || 0; if (!n) return null;
            const on = activeTier === "all" || activeTier === tier;
            return (
              <button key={tier} onClick={() => onTierClick(tier === activeTier ? "all" : tier)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px 3px 7px", borderRadius: 999,
                  border: `1px solid ${on ? TIER_COLOR[tier] + "45" : "transparent"}`, background: on ? TIER_COLOR[tier] + "16" : "transparent",
                  color: t.textDim, fontFamily: "inherit", fontSize: 11.5, fontWeight: 600, cursor: "pointer", opacity: on ? 1 : 0.4, transition: "all .18s" }}>
                <TierIcon tier={tier} size={11} /> {TT[tier].label} <span style={{ color: t.textMuted, fontWeight: 500 }}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>
      <TuxTip playable={playable} total={games.length} />
    </div>
  );
}

function TierFilter({ games, active, onChange }) {
  const t = useTheme();
  const counts = useMemo(() => { const c = {}; games.forEach(g => c[g.tier] = (c[g.tier] || 0) + 1); return c; }, [games]);
  const tabs = [{ key: "all", label: "All", n: games.length, color: t.accent }, ...TORD.filter(x => counts[x]).map(x => ({ key: x, label: TT[x].label, n: counts[x], color: TIER_COLOR[x] }))];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
      {tabs.map(({ key, label, n, color }) => {
        const on = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 11,
            border: `1px solid ${on ? color + "60" : t.borderSoft}`, background: on ? color + "1c" : t.panel,
            color: on ? color : t.textDim, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all .16s",
          }}>
            {key !== "all" && <TierIcon tier={key} size={12} color={on ? color : t.textMuted} />}
            {label} <span style={{ opacity: 0.7, fontWeight: 500 }}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}

function AiBadge() {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      position: "absolute", bottom: 18, right: 18, background: t.panel2, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: open ? "13px 16px" : "9px 13px", fontSize: 12, cursor: "pointer", zIndex: 30,
      transition: "all .2s", maxWidth: open ? 270 : "none", userSelect: "none", boxShadow: t.shadow,
    }}>
      {open ? (
        <div style={{ color: t.textDim, lineHeight: 1.65 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.accent, fontWeight: 700, marginBottom: 4, letterSpacing: 0.3 }}><BoltIcon c={t.accent} /> AI-GENERATED SLOP</div>
          This entire UI was hallucinated by Claude (Anthropic). No human developers were hired, bothered, or inconvenienced.
          <div style={{ color: t.textMuted, marginTop: 6 }}>Click to collapse</div>
        </div>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.textDim, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap" }}><BoltIcon c={t.accent} /> AI SLOP <ExtIcon s={11} /></span>
      )}
    </div>
  );
}

function Spinner({ mode }) {
  const t = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "96px 0" }}>
      <div style={{ width: 34, height: 34, margin: "0 auto 20px", border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: t.textDim }}>
        {mode === "library" ? "Fetching your library & ProtonDB tiers…" : "Searching the Steam store…"}
      </div>
      {mode === "library" && <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 7 }}>Large libraries can take up to a minute.</div>}
    </div>
  );
}

function EmptyState({ mode }) {
  const t = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "84px 20px" }}>
      <div style={{ display: "inline-block", marginBottom: 18 }}><Tux size={72} /></div>
      <div style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 8 }}>
        {mode === "library" ? "Let's scan your shelf" : "Check any game for Linux"}
      </div>
      <div style={{ fontSize: 13.5, color: t.textDim, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
        {mode === "library"
          ? "Enter your Steam ID, vanity name, or profile URL and Tux will sort your whole library by Proton compatibility tier."
          : "Search by game name or paste a Steam App ID to see how it runs on Linux via Proton."}
      </div>
      {mode === "library" && (
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 12 }}>
          Your Steam profile’s game details must be set to <strong style={{ color: t.textDim }}>Public</strong>.
        </div>
      )}
    </div>
  );
}

function Footer() {
  const t = useTheme();
  const link = { color: t.accent, textDecoration: "none" };
  return (
    <footer style={{ marginTop: 44, paddingTop: 22, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.textMuted, lineHeight: 1.85 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: t.textDim, fontWeight: 700, marginBottom: 8 }}>
        <Tux size={20} /> Data sources &amp; legal
      </div>
      <p>
        Compatibility tiers come from <a href="https://www.protondb.com" target="_blank" rel="noopener" style={link}>ProtonDB</a> — a community project tracking Windows-game compatibility on Linux via Proton. All ratings are user-reported. ProtonScan is an unofficial third-party viewer, <strong style={{ color: t.textDim }}>not affiliated with ProtonDB</strong>.
      </p>
      <p style={{ marginTop: 6 }}>
        Game info and cover art © their respective publishers. Steam data via <a href="https://store.steampowered.com" target="_blank" rel="noopener" style={link}>Valve Corporation</a> — <strong style={{ color: t.textDim }}>not affiliated with Valve or Steam</strong>. Powered by Steam.
      </p>
      <p style={{ marginTop: 6, color: t.borderSoft }}>ProtonScan · Personal, non-commercial use · Accuracy depends on community reports.</p>
    </footer>
  );
}

const normGame = g => ({ ...g, rep: g.rep ?? g.reports ?? 0, pt: g.pt ?? g.playtime ?? 0, antiCheat: g.antiCheat ?? g.anticheat ?? false });
const sortByTier = arr => [...arr].sort((a, b) => TORD.indexOf(a.tier) - TORD.indexOf(b.tier));

// ═══ APP ══════════════════════════════════════════════════════════════════════
// demo=true  → preloaded mock library (used on the design canvas)
// demo=false → live: real fetch from PROTON_CONFIG.apiBase, with states
function ProtonScan({ themeKey = "hearth", demo = false }) {
  const t = PS_THEMES[themeKey];
  const [mode, setMode] = useState("library");
  const [activeTier, setTier] = useState("all");
  const [filter, setFilter] = useState("");
  const [input, setInput] = useState("");
  const [games, setGames] = useState(demo ? sortByTier(GAMES) : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetTo = m => { setMode(m); setTier("all"); setFilter(""); setInput(""); if (!demo) { setGames([]); setError(null); } };

  const submit = async () => {
    if (demo || loading || !input.trim()) return;
    setLoading(true); setError(null); setGames([]); setTier("all");
    try {
      const base = (window.PROTON_CONFIG || {}).apiBase || "";
      const url = mode === "library"
        ? `${base}/games/${encodeURIComponent(input.trim())}`
        : `${base}/search?q=${encodeURIComponent(input.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      setGames(sortByTier((data.games || []).map(normGame)));
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const shown = useMemo(() => {
    let g = games;
    if (activeTier !== "all") g = g.filter(x => x.tier === activeTier);
    if (filter) g = g.filter(x => x.name.toLowerCase().includes(filter.toLowerCase()));
    return g;
  }, [games, activeTier, filter]);

  const hasResults = games.length > 0;
  const inputProps = demo
    ? { readOnly: true, value: mode === "library" ? "you" : "" }
    : { value: input, onChange: e => setInput(e.target.value), onKeyDown: e => e.key === "Enter" && submit() };

  return (
    <ThemeCtx.Provider value={t}>
      <div style={{ height: "100%", overflow: "hidden", background: t.bg, color: t.text, fontFamily: t.font, display: "flex", flexDirection: "column", position: "relative" }}>

        {/* HEADER */}
        <header style={{ background: t.bg + "f2", borderBottom: `1px solid ${t.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", backdropFilter: "blur(8px)", flexShrink: 0, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Tux size={34} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3, color: t.text, lineHeight: 1 }}>
                Proton<span style={{ color: t.accent }}>Scan</span>
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, marginTop: 3 }}>Linux compatibility portal</div>
            </div>
          </div>

          <ModeToggle mode={mode} onChange={resetTo} />

          <div style={{ flex: 1, display: "flex", gap: 8, minWidth: 220, maxWidth: 440 }}>
            <input {...inputProps} placeholder={mode === "library" ? "Steam ID, username, or profile URL…" : "Game name or Steam App ID…"}
              style={{ flex: 1, background: t.panel2, border: `1px solid ${t.borderSoft}`, borderRadius: 11, padding: "10px 14px", color: t.text, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
            <button onClick={submit} disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, background: loading ? t.panel2 : t.accent, border: "none", borderRadius: 11, padding: "10px 18px", color: loading ? t.textMuted : t.accentInk, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: loading ? "default" : "pointer", whiteSpace: "nowrap" }}>
              {mode === "library" ? <><LibIcon s={14} /> Scan</> : <><SearchIcon s={14} /> Search</>}
            </button>
          </div>

          {(demo || hasResults) && (
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }}><SearchIcon s={14} /></span>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter results…"
                style={{ background: t.panel2, border: `1px solid ${t.borderSoft}`, borderRadius: 11, padding: "9px 14px 9px 34px", color: t.text, fontFamily: "inherit", fontSize: 13, outline: "none", width: 180 }} />
            </div>
          )}
        </header>

        {/* MAIN */}
        <main style={{ flex: 1, overflow: demo ? "hidden" : "auto", padding: "24px 28px 32px" }}>
          {error && (
            <div style={{ background: TIER_COLOR.borked + "16", border: `1px solid ${TIER_COLOR.borked}44`, borderRadius: t.radius, padding: "14px 18px", marginBottom: 16, fontSize: 13, color: TIER_COLOR.borked, display: "flex", alignItems: "center", gap: 9 }}>
              <TierIcon tier="borked" size={15} color={TIER_COLOR.borked} /> {error}
            </div>
          )}

          {loading ? <Spinner mode={mode} />
            : !hasResults ? <EmptyState mode={mode} />
            : (
              <>
                {mode === "library" && <StatsBar games={games} activeTier={activeTier} onTierClick={setTier} />}
                <TierFilter games={games} active={activeTier} onChange={setTier} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))", gap: t.gap }}>
                  {shown.map(g => <GameCard key={g.id} game={g} />)}
                </div>
                {shown.length === 0 && <div style={{ textAlign: "center", padding: "70px 0", color: t.textMuted, fontSize: 14 }}>No games match that filter.</div>}
                {!demo && <Footer />}
              </>
            )}
        </main>

        <AiBadge />
      </div>
    </ThemeCtx.Provider>
  );
}

Object.assign(window, { ProtonScan, PS_THEMES, Tux, TierIcon });
