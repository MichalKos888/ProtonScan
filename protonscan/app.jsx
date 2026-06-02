// protonscan/app.jsx
// Transformed in-browser by Babel standalone.
// Globals: React, ReactDOM (CDN), TIERS, PROTON_CONFIG (data.js)

const { useState, useMemo } = React;
const T = window.TIERS;
const CFG = window.PROTON_CONFIG;

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  bg:          "#16110c",
  surface:     "#1e1811",
  surface2:    "#271f15",
  border:      "#3d2e1f",
  borderHover: "#7a5535",
  text:        "#f1ebdf",
  textDim:     "#9c8470",
  textMuted:   "#5c4535",
  accent:      "#d98b5f",
  accentBg:    "rgba(217,139,95,0.12)",
  accentGlow:  "rgba(217,139,95,0.25)",
  mono:        "'Space Mono', monospace",
  sans:        "'DM Sans', sans-serif",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const pdbUrl  = id => `https://www.protondb.com/app/${id}`;
const fmtHrs  = min => { const h = Math.round(min / 60); return h < 1 ? "<1h" : `${h}h`; };
const fmtNum  = n => n > 0 ? n.toLocaleString() : "—";

// ─── GameCard ─────────────────────────────────────────────────────────────────
function GameCard({ game }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const cfg = T[game.tier] || T.unknown;

  return (
    <a
      href={pdbUrl(game.id)}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "block", textDecoration: "none",
        background: C.surface,
        border: `1px solid ${hov ? cfg.color + "80" : C.border}`,
        borderRadius: "8px", overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.18s",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? `0 8px 28px rgba(0,0,0,0.55), 0 0 0 1px ${cfg.color}30` : "none",
        animation: "fadeUp 0.3s ease both",
      }}
    >
      {/* Cover + overlay */}
      <div style={{ position: "relative", paddingTop: "46.7%", background: C.surface2, overflow: "hidden" }}>
        {!imgErr ? (
          <img
            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.id}/header.jpg`}
            alt={game.name}
            onError={() => setImgErr(true)}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s, opacity 0.2s",
              transform: hov ? "scale(1.06)" : "scale(1)",
              opacity: hov ? 0.45 : 1,
            }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${C.surface2}, ${cfg.color}18)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textMuted, textAlign: "center", padding: "0 12px" }}>
              {game.name.toUpperCase()}
            </span>
          </div>
        )}

        {/* Tier badge — always visible */}
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          background: "rgba(22,17,12,0.9)", border: `1px solid ${cfg.color}`,
          borderRadius: "4px", padding: "2px 7px", backdropFilter: "blur(4px)",
        }}>
          <span style={{ fontFamily: C.mono, fontSize: "9px", fontWeight: "bold", color: cfg.color, letterSpacing: "1.5px" }}>
            {cfg.icon} {cfg.label.toUpperCase()}
          </span>
        </div>

        {/* Hover detail overlay */}
        {hov && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "12px 13px",
            background: "linear-gradient(to top, rgba(22,17,12,0.97) 0%, rgba(22,17,12,0.6) 55%, transparent 100%)",
          }}>
            <div style={{ fontFamily: C.mono, fontSize: "9px", color: cfg.color, letterSpacing: "1px", marginBottom: "5px" }}>
              {cfg.icon} {cfg.label.toUpperCase()}
            </div>
            <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, lineHeight: 1.9 }}>
              {cfg.desc}<br />
              Reports: {fmtNum(game.reports)}
              {game.playtime > 0 && <><br />Your playtime: {fmtHrs(game.playtime)}</>}
            </div>
            <div style={{ marginTop: "8px", fontFamily: C.mono, fontSize: "9px", color: C.accent, letterSpacing: "1px" }}>
              OPEN ON PROTONDB →
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div style={{
        padding: "9px 12px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: C.sans, fontWeight: 500, fontSize: "12px", color: C.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px",
        }}>
          {game.name}
        </span>
        <div style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: cfg.color, flexShrink: 0, marginLeft: "6px",
          boxShadow: `0 0 5px ${cfg.color}`,
        }} />
      </div>
    </a>
  );
}

// ─── ModeToggle ───────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange }) {
  const modes = [
    { key: "library", label: "📚 My Library" },
    { key: "search",  label: "🔍 Search All" },
  ];
  return (
    <div style={{
      display: "flex", gap: "2px",
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: "7px", padding: "3px",
    }}>
      {modes.map(({ key, label }) => {
        const active = mode === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            padding: "6px 14px", borderRadius: "5px", border: "none",
            background: active ? C.accent : "transparent",
            color: active ? C.bg : C.textDim,
            fontFamily: C.mono, fontWeight: "bold", fontSize: "10px",
            letterSpacing: "1px", cursor: "pointer", transition: "all 0.15s",
          }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────
function StatsBar({ games, onTierClick, activeTier }) {
  const counts = useMemo(() => {
    const c = {};
    games.forEach(g => { c[g.tier] = (c[g.tier] || 0) + 1; });
    return c;
  }, [games]);

  const playable = (counts.native || 0) + (counts.platinum || 0) + (counts.gold || 0);
  const pct = games.length ? Math.round(playable / games.length * 100) : 0;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: "8px", padding: "16px 20px", marginBottom: "14px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <span style={{ fontFamily: C.mono, fontWeight: "bold", fontSize: "24px", color: C.text }}>
          {games.length}&nbsp;
          <span style={{ fontSize: "9px", color: C.textMuted, letterSpacing: "2px" }}>GAMES</span>
        </span>
        <span style={{ fontFamily: C.mono, fontSize: "11px", color: "#5dd98a" }}>
          {pct}% fully playable on Linux
        </span>
      </div>

      {/* Distribution bar — clickable */}
      <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "10px", cursor: "pointer" }}>
        {Object.entries(T).map(([tier, cfg]) => {
          const p = ((counts[tier] || 0) / games.length) * 100;
          return p > 0 ? (
            <div key={tier} title={`${cfg.label}: ${counts[tier]}`}
              onClick={() => onTierClick(tier === activeTier ? "all" : tier)}
              style={{
                width: `${p}%`, background: cfg.color,
                opacity: activeTier === "all" || activeTier === tier ? 0.85 : 0.2,
                transition: "opacity 0.2s",
              }}
            />
          ) : null;
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        {Object.entries(T).map(([tier, cfg]) => {
          const count = counts[tier] || 0;
          if (!count) return null;
          return (
            <span key={tier} onClick={() => onTierClick(tier === activeTier ? "all" : tier)}
              style={{
                fontFamily: C.mono, fontSize: "9px", color: C.textMuted,
                cursor: "pointer", opacity: activeTier === "all" || activeTier === tier ? 1 : 0.35,
                transition: "opacity 0.2s",
              }}>
              <span style={{ color: cfg.color }}>■</span> {cfg.label} {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── TierFilter ───────────────────────────────────────────────────────────────
function TierFilter({ games, active, onChange }) {
  const counts = useMemo(() => {
    const c = { all: games.length };
    games.forEach(g => { c[g.tier] = (c[g.tier] || 0) + 1; });
    return c;
  }, [games]);

  const tabs = [
    { key: "all", label: `All (${games.length})`, cfg: null },
    ...Object.entries(T).filter(([t]) => counts[t]).map(([t, v]) => ({
      key: t, label: `${v.label} (${counts[t]})`, cfg: v,
    })),
  ];

  return (
    <div style={{
      display: "flex", gap: "3px", flexWrap: "wrap",
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: "7px", padding: "4px",
    }}>
      {tabs.map(({ key, label, cfg }) => {
        const isActive = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            padding: "5px 11px", borderRadius: "5px", border: "none",
            background: isActive ? (cfg ? cfg.bg : C.accentBg) : "transparent",
            color: isActive ? (cfg ? cfg.color : C.accent) : C.textMuted,
            fontFamily: C.mono, fontSize: "9px", fontWeight: "bold",
            letterSpacing: "1px", cursor: "pointer", transition: "all 0.15s",
            opacity: isActive ? 1 : 0.7,
          }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── AiBadge ─────────────────────────────────────────────────────────────────
function AiBadge() {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      position: "fixed", bottom: "20px", right: "20px",
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: "6px", padding: open ? "10px 14px" : "6px 11px",
      fontFamily: C.mono, fontSize: "10px", cursor: "pointer",
      zIndex: 999, transition: "all 0.2s", maxWidth: open ? "260px" : "none",
      userSelect: "none",
    }}>
      {open ? (
        <span style={{ color: C.textDim, lineHeight: 1.8, display: "block" }}>
          ⚡ <span style={{ color: C.accent }}>AI-GENERATED SLOP</span><br />
          This entire UI was hallucinated by{" "}
          <a href="https://claude.ai" target="_blank" onClick={e => e.stopPropagation()}
            style={{ color: C.accent }}>Claude</a> (Anthropic).<br />
          No human developers were hired, bothered, or inconvenienced.<br />
          <span style={{ color: C.textMuted }}>Click to collapse</span>
        </span>
      ) : (
        <span style={{ color: C.textMuted }}>⚡ AI SLOP ↗</span>
      )}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const linkStyle = { color: C.accent, textDecoration: "none" };
  return (
    <footer style={{
      marginTop: "48px", paddingTop: "24px",
      borderTop: `1px solid ${C.border}`,
      fontFamily: C.mono, fontSize: "10px",
      color: C.textMuted, lineHeight: 2,
    }}>
      <div style={{ color: C.textDim, marginBottom: "8px", letterSpacing: "2px" }}>
        DATA SOURCES &amp; LEGAL DISCLOSURE
      </div>
      <p>
        Compatibility data sourced from{" "}
        <a href="https://www.protondb.com" target="_blank" style={linkStyle}>ProtonDB</a>
        {" "}— a community-driven project tracking Windows game compatibility on Linux via Proton.
        All tier ratings are user-reported. ProtonScan is an unofficial third-party viewer and is{" "}
        <strong style={{ color: C.textDim }}>not affiliated with ProtonDB or its creators</strong>.
      </p>
      <p style={{ marginTop: "6px" }}>
        Game information and images © their respective publishers. Steam data provided by{" "}
        <a href="https://store.steampowered.com" target="_blank" style={linkStyle}>Valve Corporation</a>.
        This tool is{" "}
        <strong style={{ color: C.textDim }}>not affiliated with Valve or Steam</strong>.
        Powered by Steam.
      </p>
      <p style={{ marginTop: "6px", color: "#3d2e1f" }}>
        ProtonScan · Personal use only · Not for commercial use ·{" "}
        Data accuracy depends on community reports
      </p>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [mode, setMode]         = useState("library");
  const [input, setInput]       = useState("");
  const [games, setGames]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [activeTier, setTier]   = useState("all");
  const [search, setSearch]     = useState("");

  const handleModeChange = m => {
    setMode(m);
    setGames([]);
    setError(null);
    setInput("");
    setTier("all");
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setGames([]);
    setTier("all");
    try {
      const url = mode === "library"
        ? `${CFG.apiBase}/games/${encodeURIComponent(input.trim())}`
        : `${CFG.apiBase}/search?q=${encodeURIComponent(input.trim())}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      setGames(data.games);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let g = games;
    if (activeTier !== "all") g = g.filter(x => x.tier === activeTier);
    if (search) g = g.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    return g;
  }, [games, activeTier, search]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: C.sans }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "rgba(22,17,12,0.95)", borderBottom: `1px solid ${C.border}`,
        padding: "12px 24px", display: "flex", alignItems: "center",
        gap: "14px", flexWrap: "wrap",
        position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(10px)",
      }}>
        {/* Logo */}
        <div>
          <div style={{ fontFamily: C.mono, fontWeight: "bold", fontSize: "15px", letterSpacing: "3px", color: C.text }}>
            PROTON<span style={{ color: C.accent }}>SCAN</span>
          </div>
          <div style={{ fontFamily: C.mono, fontSize: "8px", color: C.textMuted, letterSpacing: "2px" }}>
            LINUX COMPATIBILITY PORTAL
          </div>
        </div>

        <ModeToggle mode={mode} onChange={handleModeChange} />

        {/* Input + action button */}
        <div style={{ flex: 1, display: "flex", gap: "7px", maxWidth: "480px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder={
              mode === "library"
                ? "Steam ID, username, or profile URL…"
                : "Game name or Steam App ID…"
            }
            style={{
              flex: 1, background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: "6px", padding: "8px 12px",
              color: C.text, fontFamily: C.mono, fontSize: "11px", outline: "none",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? C.surface2 : C.accent,
              border: "none", borderRadius: "6px", padding: "8px 16px",
              color: loading ? C.textMuted : C.bg,
              fontFamily: C.mono, fontWeight: "bold", fontSize: "10px",
              letterSpacing: "1.5px", cursor: loading ? "default" : "pointer",
              whiteSpace: "nowrap", transition: "background 0.15s",
            }}
          >
            {loading ? "…" : mode === "library" ? "SCAN" : "SEARCH"}
          </button>
        </div>

        {/* Inline search filter (shown once results exist) */}
        {games.length > 0 && (
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter results…"
            style={{
              marginLeft: "auto", background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: "6px", padding: "7px 12px",
              color: C.text, fontFamily: C.mono, fontSize: "11px", outline: "none", width: "160px",
            }}
          />
        )}
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 60px" }}>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.3)",
            borderRadius: "8px", padding: "13px 18px", marginBottom: "16px",
            fontFamily: C.mono, fontSize: "11px", color: "#e05555",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{
              width: "32px", height: "32px", margin: "0 auto 20px",
              border: `3px solid ${C.border}`, borderTopColor: C.accent,
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
            <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, letterSpacing: "2px" }}>
              {mode === "library" ? "FETCHING LIBRARY & PROTONDB TIERS…" : "SEARCHING STEAM STORE…"}
            </div>
            {mode === "library" && (
              <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textMuted, marginTop: "8px", opacity: 0.5 }}>
                Large libraries may take up to a minute
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && games.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🐧</div>
            <div style={{ fontFamily: C.mono, fontSize: "12px", color: C.textMuted, letterSpacing: "2px" }}>
              {mode === "library"
                ? "ENTER YOUR STEAM ID TO SEE YOUR LIBRARY BY TIER"
                : "SEARCH ANY GAME TO CHECK ITS LINUX COMPATIBILITY"}
            </div>
            {mode === "search" && (
              <div style={{ fontFamily: C.mono, fontSize: "10px", color: "#3d2e1f", marginTop: "10px" }}>
                You can also enter a Steam App ID directly
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && games.length > 0 && (
          <>
            {mode === "library" && (
              <StatsBar games={games} activeTier={activeTier} onTierClick={setTier} />
            )}

            <div style={{ marginBottom: "14px" }}>
              <TierFilter games={games} active={activeTier} onChange={setTier} />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "10px",
            }}>
              {filtered.map(game => <GameCard key={game.id} game={game} />)}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>
                NO GAMES MATCHING FILTER
              </div>
            )}
          </>
        )}

        <Footer />
      </main>

      <AiBadge />
    </div>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
