#!/usr/bin/env python3
"""
ProtonScan diagnostic — run this to see why library mode shows wrong tiers.

Usage:
  python test_protondb.py                   # tests known games only
  python test_protondb.py <steam_id_or_name># also scans your library via the Worker
"""

import asyncio
import sys
from urllib.parse import quote
import httpx

WORKER = "https://proton-portal-api.michal070205.workers.dev"
PDBURL = "https://www.protondb.com/api/v1/reports/summaries/{}.json"
UA     = "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0"

# A handful of games that should have real ProtonDB tiers
KNOWN = [
    (292030,  "The Witcher 3"),
    (1091500, "Cyberpunk 2077"),
    (413150,  "Stardew Valley"),
    (601150,  "Devil May Cry 5"),
    (620,     "Portal 2"),
]


def resolve_tier(d: dict) -> str:
    """Same logic as the fixed worker: pending → bestReportedTier fallback."""
    raw = d.get("tier", "")
    if not raw or raw == "pending":
        return d.get("bestReportedTier") or "unknown"
    return raw


async def check_protondb(client: httpx.AsyncClient, app_id: int):
    rows = {}
    for label, hdrs in [("with UA", {"User-Agent": UA}), ("no UA", {})]:
        try:
            r = await client.get(PDBURL.format(app_id), headers=hdrs, timeout=8.0)
            if r.status_code == 200:
                d = r.json()
                rows[label] = {
                    "http": 200,
                    "tier": d.get("tier", "—"),
                    "best": d.get("bestReportedTier", "—"),
                    "resolved": resolve_tier(d),
                    "total": d.get("total", 0),
                }
            else:
                rows[label] = {"http": r.status_code}
        except Exception as e:
            rows[label] = {"http": f"ERROR ({e})"}
    return rows


async def worker_get(client: httpx.AsyncClient, path: str):
    try:
        r = await client.get(f"{WORKER}{path}", timeout=60.0)
        return r.status_code, (r.json() if r.status_code == 200 else None)
    except Exception as e:
        return f"ERR: {e}", None


async def main():
    steam_input = sys.argv[1] if len(sys.argv) > 1 else None

    async with httpx.AsyncClient() as client:

        # ── 1. Direct ProtonDB API calls ──────────────────────────────────
        print("\n━━ Direct ProtonDB API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"  {'Game':<25} {'app':>8}  {'UA→tier':>12}  {'UA→best':>12}  {'resolved':>10}  {'no-UA→tier':>12}")
        print(f"  {'-'*25} {'-'*8}  {'-'*12}  {'-'*12}  {'-'*10}  {'-'*12}")
        for app_id, name in KNOWN:
            res = await check_protondb(client, app_id)
            ua = res["with UA"]
            no = res["no UA"]
            tier_ua  = ua.get("tier",     "?") if isinstance(ua, dict) else str(ua.get("http"))
            best_ua  = ua.get("best",     "?") if isinstance(ua, dict) else "—"
            resolved = ua.get("resolved", "?") if isinstance(ua, dict) else "—"
            tier_no  = no.get("tier",     "?") if isinstance(no, dict) else str(no.get("http"))
            print(f"  {name:<25} {app_id:>8}  {tier_ua:>12}  {best_ua:>12}  {resolved:>10}  {tier_no:>12}")

        print()
        print("  Key insight:")
        print("  • If 'no UA' column shows HTTP 403/429 but 'with UA' shows 200 → User-Agent fix matters")
        print("  • If tier='pending' but best='gold'/'platinum' → the pending-fallback fix matters")
        print("  • If both columns show 200 with same tier → ProtonDB is fine; issue is elsewhere")

        # ── 2. Worker search endpoint (should already work) ───────────────
        print("\n━━ Worker /search?q=Cyberpunk+2077 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        status, data = await worker_get(client, "/search?q=Cyberpunk+2077")
        if data:
            for g in (data.get("games") or [])[:5]:
                print(f"  {g['name']:<40}  tier={g['tier']:<12}  reports={g.get('reports',0)}")
        else:
            print(f"  HTTP {status}")

        # ── 3. Worker library endpoint (the broken one) ───────────────────
        if steam_input:
            path = f"/games/{quote(steam_input)}"
            print(f"\n━━ Worker {path} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print("  (this may take up to a minute for large libraries)")
            status, data = await worker_get(client, path)
            if data:
                games   = data.get("games") or []
                total   = len(games)
                unknown = sum(1 for g in games if g["tier"] == "unknown")
                pct     = 100 * unknown // total if total else 0
                print(f"  Total: {total}   Unknown: {unknown} ({pct}%)")
                from collections import Counter
                counts = Counter(g["tier"] for g in games)
                for tier, n in sorted(counts.items(), key=lambda x: -x[1]):
                    print(f"    {tier:<12} {n:>4}")
                print(f"\n  First 15 results:")
                for g in games[:15]:
                    print(f"    {g['name']:<42}  tier={g['tier']}")

                # ── Verify a sample of unknown games against ProtonDB directly
                unknown_games = [g for g in games if g["tier"] == "unknown"]
                sample = unknown_games[:15]
                if sample:
                    print(f"\n━━ Verifying {len(sample)} 'unknown' games directly on ProtonDB ━━━━━━")
                    found = 0
                    for g in sample:
                        res = await check_protondb(client, g["id"])
                        ua = res["with UA"]
                        if isinstance(ua, dict) and ua["http"] == 200:
                            found += 1
                            print(f"  HAS DATA  {g['name']:<38} tier={ua['tier']:<10} best={ua['best']}")
                        else:
                            http = ua.get("http") if isinstance(ua, dict) else ua
                            print(f"  NO DATA   {g['name']:<38} (HTTP {http})")

                    succeeded = total - unknown
                    print(f"\n  {found}/{len(sample)} sampled 'unknown' games actually have ProtonDB data.")
                    if found > 0:
                        subreqs = 1 + succeeded * 2
                        print(f"\n  DIAGNOSIS: Worker correctly enriched {succeeded} games")
                        print(f"  (1 GetOwnedGames + {succeeded}×2 subrequests = {subreqs} total),")
                        print(f"  then silently failed for the rest.")
                        print(f"  Cloudflare Workers FREE plan hard-caps subrequests at 50/request.")
                        print(f"  With 2 subrequests per game (ProtonDB + Steam native check),")
                        print(f"  only (50-1)/2 = 24 games can be enriched before the cap is hit.")
                    else:
                        print("  → These games genuinely have no ProtonDB data. 'unknown' is correct.")
            else:
                print(f"  HTTP {status}")
        else:
            print("\n  Tip: pass your Steam ID to also test library mode:")
            print("  python test_protondb.py YOUR_STEAM_ID_OR_USERNAME")


asyncio.run(main())
