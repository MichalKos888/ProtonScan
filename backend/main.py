import asyncio
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import httpx

app = FastAPI(title="ProtonScan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your GitHub Pages URL in production
    allow_methods=["GET"],
    allow_headers=["*"],
)

STEAM_KEY = os.environ.get("STEAM_API_KEY", "")
_tier_cache: dict = {}


# ─── Shared helpers ───────────────────────────────────────────────────────────

async def resolve_steam_id(client: httpx.AsyncClient, raw: str) -> str:
    raw = raw.strip()
    if raw.isdigit() and len(raw) >= 15:
        return raw
    if "/profiles/" in raw:
        return raw.rstrip("/").split("/profiles/")[-1]
    vanity = raw.rstrip("/").split("/id/")[-1] if "/id/" in raw else raw
    r = await client.get(
        "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/",
        params={"key": STEAM_KEY, "vanityurl": vanity},
        timeout=10.0,
    )
    resp = r.json().get("response", {})
    if resp.get("success") == 1:
        return resp["steamid"]
    raise HTTPException(400, "Steam profile not found. Check the ID/URL and make sure the profile is Public.")


_PROTONDB_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
}


async def fetch_tier(client: httpx.AsyncClient, app_id: int, sem: asyncio.Semaphore) -> dict:
    if app_id in _tier_cache:
        return _tier_cache[app_id]
    async with sem:
        try:
            r = await client.get(
                f"https://www.protondb.com/api/v1/reports/summaries/{app_id}.json",
                headers=_PROTONDB_HEADERS,
                timeout=8.0,
            )
            if r.status_code == 200:
                d = r.json()
                raw_tier = d.get("tier", "")
                # Fall back to bestReportedTier when tier is "pending" (few reports)
                # — matches what ProtonDB's website displays.
                if not raw_tier or raw_tier == "pending":
                    raw_tier = d.get("bestReportedTier", "unknown")
                result = {"tier": raw_tier or "unknown", "reports": d.get("total", 0)}
            elif r.status_code == 404:
                result = {"tier": "unknown", "reports": 0}
            else:
                # Rate-limited or server error — don't cache so next scan can retry.
                return {"tier": "unknown", "reports": 0}
        except Exception:
            # Network/timeout error — don't cache.
            return {"tier": "unknown", "reports": 0}
    _tier_cache[app_id] = result
    return result


# ─── GET /games/{steam_input}  (library mode) ─────────────────────────────────

@app.get("/games/{steam_input:path}")
async def get_games(steam_input: str):
    if not STEAM_KEY:
        raise HTTPException(500, "STEAM_API_KEY environment variable is not set.")

    async with httpx.AsyncClient() as client:
        steam_id = await resolve_steam_id(client, steam_input)

        r = await client.get(
            "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
            params={"key": STEAM_KEY, "steamid": steam_id, "include_appinfo": 1, "format": "json"},
            timeout=15.0,
        )
        data = r.json().get("response", {})
        if "games" not in data:
            raise HTTPException(
                404,
                "No games found. Set your Steam profile to Public: "
                "Steam → Profile → Edit → Game details: Public.",
            )

        games = data["games"]
        sem = asyncio.Semaphore(15)

        async def enrich(game: dict) -> dict:
            td = await fetch_tier(client, game["appid"], sem)
            return {
                "id": game["appid"],
                "name": game.get("name", "Unknown"),
                "tier": td["tier"],
                "reports": td["reports"],
                "playtime": game.get("playtime_forever", 0),
            }

        results = await asyncio.gather(*[enrich(g) for g in games])
    return {"games": list(results), "total": len(results)}


# ─── GET /search?q=...  (search all games mode) ───────────────────────────────

@app.get("/search")
async def search_games(q: str):
    q = q.strip()
    if not q:
        raise HTTPException(400, "Query cannot be empty.")

    async with httpx.AsyncClient() as client:
        sem = asyncio.Semaphore(10)

        # If numeric → treat directly as a Steam App ID
        if q.isdigit():
            app_id = int(q)
            td = await fetch_tier(client, app_id, sem)
            # Try to get the name from the Steam store
            try:
                r = await client.get(
                    f"https://store.steampowered.com/api/appdetails?appids={app_id}&filters=basic",
                    timeout=8.0,
                )
                store = r.json().get(str(app_id), {})
                name = store.get("data", {}).get("name", f"App {app_id}") if store.get("success") else f"App {app_id}"
            except Exception:
                name = f"App {app_id}"
            return {"games": [{"id": app_id, "name": name, "tier": td["tier"], "reports": td["reports"], "playtime": 0}], "total": 1}

        # Name search via Steam store search API
        try:
            r = await client.get(
                "https://store.steampowered.com/api/storesearch/",
                params={"term": q, "l": "english", "cc": "US", "category1": "998"},
                timeout=10.0,
            )
            items = r.json().get("items", [])[:20]
        except Exception:
            raise HTTPException(503, "Steam store search failed. Try again or use an App ID.")

        if not items:
            return {"games": [], "total": 0}

        async def enrich_search(item: dict) -> dict:
            td = await fetch_tier(client, item["id"], sem)
            return {
                "id": item["id"],
                "name": item["name"],
                "tier": td["tier"],
                "reports": td["reports"],
                "playtime": 0,
            }

        results = await asyncio.gather(*[enrich_search(i) for i in items])
    return {"games": list(results), "total": len(results)}


# ─── Serve React build in production (optional) ───────────────────────────────
_static = Path(__file__).parent / "static"
if _static.exists():
    app.mount("/", StaticFiles(directory=_static, html=True), name="static")
