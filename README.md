# ProtonScan 🐧

An unofficial Linux game compatibility portal powered by [ProtonDB](https://www.protondb.com) and the Steam API.

Browse your Steam library sorted by Proton compatibility tier (Native / Platinum / Gold / Silver / Bronze / Borked), or search any game to check its Linux status.

> **Disclaimer:** ProtonScan is an unofficial third-party viewer. Not affiliated with ProtonDB, Valve, or Steam. All compatibility data is user-reported and sourced from ProtonDB. Game images and information © their respective publishers. Powered by Steam.

---

## Features

- **My Library** — scan your full Steam library grouped by compatibility tier
- **Search All** — look up any game by name or Steam App ID
- Hover any game card for tier details, report count, and playtime
- Click any card to open the full ProtonDB entry
- Works as a static site (no build step) — deployable on GitHub Pages

---

## Architecture

```
GitHub Pages          Homelab (Docker)
─────────────         ────────────────
index.html      →     FastAPI backend
protonscan/           └─ Steam API (library fetch)
  data.js             └─ ProtonDB API (tier lookup)
  app.jsx
```

---

## Local Development

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate.fish   # or activate for bash/zsh
pip install -r requirements.txt

cp ../.env.example ../.env
# edit .env and add your Steam API key
# get one free at: https://steamcommunity.com/dev/apikey

export STEAM_API_KEY=your_key_here
uvicorn main:app --reload
```

### 2. Frontend

In a second terminal, from the project root:

```bash
python -m http.server 3000
```

Open `http://localhost:3000`.

---

## Deployment

### Frontend → GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source**: Deploy from branch → `main` → `/ (root)`
3. Open `protonscan/data.js` and set `apiBase` to your backend URL:
   ```js
   apiBase: "https://api.yourdomain.com"
   ```

### Backend → Homelab (Docker)

```bash
# On your server / NAS
git clone https://github.com/youruser/proton-portal.git
cd proton-portal

cp .env.example .env
nano .env   # add your Steam API key

docker compose up -d --build
```

Then add a proxy host in **nginx-proxy-manager**:
- Domain: `api.yourdomain.com`
- Forward to: `localhost:8765`
- Enable SSL (Let's Encrypt)

---

## Configuration

| File | What to change |
|------|---------------|
| `protonscan/data.js` | `apiBase` URL — point to your deployed backend |
| `docker-compose.yml` | Port `8765` if already taken on your host |
| `.env` | Your Steam API key |

---

## Steam Profile Requirement

Your Steam profile **game details must be set to Public**:  
Steam → View Profile → Edit Profile → Privacy Settings → Game details: **Public**

---

## Credits & Legal

- Compatibility data: [ProtonDB](https://www.protondb.com) — community-driven, user-reported
- Game data & images: [Steam / Valve Corporation](https://store.steampowered.com)
- This tool is not affiliated with ProtonDB, Valve, or Steam
- Personal, non-commercial use only

---

> ⚡ *This UI was hallucinated by [Claude](https://claude.ai) (Anthropic). No human developers were inconvenienced.*
