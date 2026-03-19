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
| `/` → `/radar` | Command center: live intel, opportunity list/timeline, **embedded geographic map** |
| `/opportunities` | Full pipeline / filters |
| `/map` | Full-screen map (same data; filters + detail panels) |
| `/agents` | Intelligence / agents |
| `/scoreboard`, `/monitor`, `/about` | Supporting views |

The map on `/radar` loads `/map?embed=1` in an iframe (no duplicate nav inside the frame).
