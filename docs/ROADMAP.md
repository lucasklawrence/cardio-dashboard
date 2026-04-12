# Cardio Dashboard — Feature Roadmap

## Phase 1: Expand Apple Health Metrics
Extract and visualize the health data we're already sitting on but not using.
See [apple-health-metrics.md](./apple-health-metrics.md) for the full list.

**Priority picks:**
- HRV (Heart Rate Variability) — the single most useful recovery metric
- Walking Heart Rate Average — passive fitness trend without needing workouts
- Sleep Analysis — correlate sleep with next-day HR/performance
- Body Mass — track weight alongside cardio metrics
- Active Energy / Exercise Minutes — daily activity rings equivalent

## Phase 2: UI & Design Upgrades
Push the dashboard from "functional React port" to "editorial data journal."
See [ui-design.md](./ui-design.md) for the full design spec.

**Priority picks:**
- Film-grain texture + vignette on body (10 lines, huge impact)
- Kill stat cards → hairline-separated editorial numerals at 104px
- FIG. counter on section headers
- Staggered reveal animation on data load
- Typographic tabs (kill the pill-in-pill pattern)

## Phase 3: Goals & Chart Enhancements
Let users set targets and track progress over time.
See [goals.md](./goals.md) for the full spec.

**Priority picks:**
- Weekly/monthly aggregation toggle on all charts
- Goal lines on RHR, VO2max, pace, and weekly volume
- Personal bests tracking + historical comparison
- Training load (acute vs chronic) estimation

## Phase 4: Backend & Persistence
Move from local-only file uploads to persistent storage.
See [infrastructure.md](./infrastructure.md) for Supabase vs GCP analysis.

**Priority picks:**
- Supabase for auth + Postgres storage (cheapest path for a personal project)
- Upload once, revisit anytime — no re-uploading the same export
- Incremental imports (only parse new data since last upload)
- Multi-device access via Supabase auth

## Phase 5: Deployment
Ship it as a real hosted app.
See [deployment.md](./deployment.md) for the strategy.

**Priority picks:**
- Vercel for the React frontend (free tier, zero-config Vite deploy)
- Supabase hosted Postgres (free tier covers personal use)
- GitHub Actions CI: lint + typecheck + test on every PR
