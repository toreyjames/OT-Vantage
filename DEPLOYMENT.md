# Single Deloitte deployment (Build Clock + OT Vantage)

This app is **one product**: **Build Clock** is the Deloitte-facing name; **OT Vantage** is the intelligence layer (same codebase, same data).

## Recommended Vercel setup

1. Use **one** Vercel project for production (e.g. rename or retire the extra project so you do not maintain two URLs).
2. Point that project at this repo: `github.com/toreyjames/OT-Vantage`.
3. If the repo root **is** this folder (`ot-vantage`), leave **Root Directory** empty. If the repo contains a parent folder, set Root Directory to `ot-vantage`.
4. After deploy, share **`/`** or **`/radar`** as the main link — both land on the command center (home redirects to `/radar`).

## Primary routes

| Route | Purpose |
|-------|---------|
| `/` → `/radar` | **One page:** Jupiter tracker (live intel, list/timeline) **+ map** side-by-side; live panel starts collapsed (click to expand) |
| `/map` | Full-screen map (same data; filters + detail panels) — also embedded on `/radar` |
| `/opportunities`, `/agents`, `/scoreboard`, `/monitor`, `/about` | **Redirect to `/radar`** (legacy URLs kept from breaking bookmarks) |

Nav shows **Build Clock** + **Map** only; the workspace is the screenshot experience (ticker, live intel, Jupiter + map).

The map on `/radar` loads `/map?embed=1` in an iframe (no duplicate nav inside the frame).
