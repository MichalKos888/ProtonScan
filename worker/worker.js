// ProtonScan — Cloudflare Worker backend
// Secrets: set STEAM_API_KEY via `wrangler secret put STEAM_API_KEY`

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return cors(null, 204);
    const url = new URL(request.url);
    try {
      // Single-game tier lookup — called by the frontend for each library game.
      // Uses exactly 1 subrequest (ProtonDB), so there's no free-plan cap issue.
      if (url.pathname.startsWith('/tier/'))
        return cors(await handleTier(url.pathname.slice(6)));
      if (url.pathname.startsWith('/games/'))
        return cors(await handleLibrary(decodeURIComponent(url.pathname.slice(7)), env));
      if (url.pathname === '/search')
        return cors(await handleSearch(url.searchParams.get('q') || '', env));
      return cors({ detail: 'Not found' }, 404);
    } catch (err) {
      return cors({ detail: err.message }, err.status || 500);
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cors(body, status = 200) {
  return new Response(body !== null ? JSON.stringify(body) : null, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json',
    },
  });
}

function fail(msg, status = 500) {
  const e = new Error(msg);
  e.status = status;
  return e;
}

async function resolveSteamId(raw, key) {
  raw = raw.trim();
  if (/^\d{15,}$/.test(raw)) return raw;
  if (raw.includes('/profiles/')) return raw.replace(/\/$/, '').split('/profiles/').pop();
  const vanity = raw.includes('/id/') ? raw.replace(/\/$/, '').split('/id/').pop() : raw;
  const r = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${encodeURIComponent(vanity)}`
  );
  const d = await r.json();
  if (d.response?.success === 1) return d.response.steamid;
  throw fail('Steam profile not found. Check the ID/URL and make sure the profile is Public.', 400);
}

// ─── ProtonDB ─────────────────────────────────────────────────────────────────

async function fetchTier(appId) {
  try {
    const r = await fetch(
      `https://www.protondb.com/api/v1/reports/summaries/${appId}.json`,
      {
        cf: { cacheTtl: 3600, cacheEverything: true },
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0' },
      }
    );
    if (r.status === 200) {
      const d = await r.json();
      // Fall back to bestReportedTier when tier is "pending" (low report count)
      // — matches what ProtonDB's own site shows.
      const tier = (!d.tier || d.tier === 'pending')
        ? (d.bestReportedTier || 'unknown')
        : d.tier;
      return { tier, reports: d.total || 0 };
    }
  } catch { /* swallow */ }
  return { tier: 'unknown', reports: 0 };
}

// ─── Route handlers ───────────────────────────────────────────────────────────

// GET /tier/:appid
// Thin proxy for a single ProtonDB lookup. The frontend calls this once per
// game so the work is spread across many Worker requests instead of one giant
// one — completely avoids the free-plan subrequest cap.
async function handleTier(appIdStr) {
  const appId = parseInt(appIdStr);
  if (!appId) throw fail('Invalid app ID.', 400);
  return fetchTier(appId);
}

// GET /games/:steamInput
// Returns the raw game list from Steam with no ProtonDB enrichment.
// Costs exactly 1 subrequest (GetOwnedGames). The frontend fetches tiers
// separately via /tier/:appid.
async function handleLibrary(steamInput, env) {
  if (!env.STEAM_API_KEY) throw fail('STEAM_API_KEY secret is not configured.', 500);

  const steamId = await resolveSteamId(steamInput, env.STEAM_API_KEY);
  const r = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/` +
    `?key=${env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&format=json`
  );
  const data = await r.json();
  if (!data.response?.games)
    throw fail('No games found. Set Steam → Profile → Privacy Settings → Game details to Public.', 404);

  return {
    games: data.response.games.map(g => ({
      id:       g.appid,
      name:     g.name || 'Unknown',
      tier:     'unknown',
      reports:  0,
      playtime: g.playtime_forever || 0,
    })),
    total: data.response.games.length,
  };
}

// GET /search?q=...
// Search is at most 20 results so inline enrichment stays within the 50-subrequest
// free-plan cap (1 ProtonDB request per result).
async function handleSearch(q, env) {
  q = q.trim();
  if (!q) throw fail('Query is empty.', 400);

  if (/^\d+$/.test(q)) {
    const appId = parseInt(q);
    const [tierData, nameRes] = await Promise.all([
      fetchTier(appId),
      fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic`)
        .then(r => r.json()).catch(() => null),
    ]);
    const name = nameRes?.[String(appId)]?.data?.name || `App ${appId}`;
    return { total: 1, games: [{ id: appId, name, tier: tierData.tier || 'unknown', reports: tierData.reports, playtime: 0 }] };
  }

  const r = await fetch(
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=US&category1=998`
  );
  const data = await r.json();
  const items = (data.items || []).slice(0, 20);
  if (!items.length) return { total: 0, games: [] };

  const enriched = await Promise.all(items.map(async i => {
    const td = await fetchTier(i.id);
    return { id: i.id, name: i.name, tier: td.tier || 'unknown', reports: td.reports, playtime: 0 };
  }));
  return { total: enriched.length, games: enriched };
}
