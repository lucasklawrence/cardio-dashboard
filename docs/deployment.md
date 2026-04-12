# Deployment Strategy

## Architecture

```
┌─────────────┐      ┌──────────────────┐
│   Vercel     │      │    Supabase      │
│  (Frontend)  │─────▶│  (Auth + DB)     │
│  React/Vite  │      │  Postgres + RLS  │
└─────────────┘      └──────────────────┘
       │
       │ git push
       │
┌─────────────┐
│   GitHub     │
│  Actions CI  │
└─────────────┘
```

---

## Frontend: Vercel

### Why Vercel
- Zero-config Vite deployment — `vercel` CLI auto-detects the framework
- Free tier: 100 GB bandwidth, unlimited deploys, preview deploys on every PR
- Automatic HTTPS, CDN, and edge caching
- Preview URLs for every branch/PR — great for testing before merge

### Setup
1. Connect the GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables for Supabase (once backend is set up):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Custom Domain (Optional)
- Free with Vercel — add a CNAME record pointing to `cname.vercel-dns.com`
- Or use the default `*.vercel.app` subdomain

---

## CI/CD: GitHub Actions

### Pipeline

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build    # includes tsc -b
      - run: npm run test
```

### What the Pipeline Does
1. **Type check** — `tsc -b` runs as part of `npm run build`, catches type errors
2. **Build** — Vite bundles the app, catches import errors and missing modules
3. **Test** — Vitest runs unit tests (already set up in Phase 1)

### Future Additions
- **Lint** — add ESLint once we settle on a config (not yet in the project)
- **E2E tests** — Playwright for upload-flow and chart-rendering tests (Phase 3+)
- **Bundle size check** — flag PRs that increase the bundle beyond a threshold
- **Lighthouse CI** — performance, accessibility, and SEO checks

---

## Database: Supabase Hosted

### Setup
- Supabase project created via the dashboard or CLI
- Region: choose closest to primary user (e.g., `us-east-1`)
- Free tier: 500 MB database, auto-managed backups

### Environment Management
- **Production:** The main Supabase project, connected to the `master` branch deploy on Vercel
- **Preview/Dev:** Supabase branch databases (available on Pro plan) or a separate free-tier project for development

### Migrations
- SQL migration files in `supabase/migrations/` tracked in git
- Applied via `supabase db push` or the MCP tool
- Schema changes go through PR review like any other code

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel env vars | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel env vars | Public anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | GitHub Secrets (CI only) | Admin key for migrations |

The anon key is safe to expose client-side — RLS policies enforce access control at the database level. The service role key is only used in CI for running migrations.

---

## Deploy Flow

### On Every PR
1. GitHub Actions runs CI (typecheck + build + test)
2. Vercel creates a preview deployment with a unique URL
3. CodeRabbit reviews the code changes
4. Manual testing on the preview URL

### On Merge to Master
1. GitHub Actions runs CI
2. Vercel auto-deploys to production
3. If there are Supabase migrations, run `supabase db push` (can be added to CI)

---

## Rollback Strategy
- **Frontend:** Vercel keeps every deployment. Rollback = promote a previous deployment in the Vercel dashboard (instant, <1 minute)
- **Database:** Supabase has point-in-time recovery on Pro plan. On Free, we rely on migration files — rollback = apply a reverse migration

---

## Cost Summary

| Service | Tier | Monthly Cost |
|---|---|---|
| Vercel | Hobby (free) | $0 |
| Supabase | Free | $0 |
| GitHub Actions | Free tier | $0 (2,000 min/mo) |
| Custom domain | Optional | ~$12/year |
| **Total** | | **$0/mo** (or $1/mo with domain) |

The entire stack runs for free on personal-project tiers. Upgrade paths exist if needed, but a single-user fitness dashboard is unlikely to exceed free-tier limits.
