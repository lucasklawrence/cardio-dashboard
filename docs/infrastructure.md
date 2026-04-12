# Backend & Persistence — Supabase vs GCP

## Problem Statement

The dashboard currently requires users to re-upload their Apple Health export every time they open the app. There's no persistence, no auth, and no way to access data across devices. We need a backend that stores parsed health data so users can upload once and revisit anytime.

---

## Option A: Supabase (Recommended)

### Why Supabase
- **Free tier** covers a personal project comfortably: 500 MB database, 1 GB storage, 50K monthly active users, unlimited API requests
- **Auth built in** — email/password or OAuth (Google, Apple) with zero custom code
- **Postgres** — full relational database, not a document store. Health data is inherently tabular (timestamps, numeric values, foreign keys to workouts)
- **Row Level Security** — each user only sees their own data, enforced at the database level
- **Real-time subscriptions** — not needed now, but useful later if we add live sync
- **Edge Functions** — serverless TypeScript functions for any server-side logic
- **JS client library** — `@supabase/supabase-js` integrates directly into the React app

### Cost at Scale
| Tier | Price | What you get |
|---|---|---|
| Free | $0/mo | 500 MB DB, 1 GB storage, 50K MAU |
| Pro | $25/mo | 8 GB DB, 100 GB storage, unlimited MAU |

For a personal dashboard with one user, the free tier is more than enough. Even with years of health data, the parsed dataset is typically 1-5 MB.

### Proposed Schema
```sql
-- Users handled by Supabase Auth

create table health_uploads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  uploaded_at timestamptz default now(),
  source      text not null,  -- 'apple_health_export'
  file_hash   text not null,  -- SHA-256 of uploaded file for dedup
  unique (user_id, file_hash)
);

create table heart_rate_samples (
  id        bigint generated always as identity primary key,
  user_id   uuid references auth.users not null,
  timestamp timestamptz not null,
  bpm       real not null
);

create table resting_hr (
  id        bigint generated always as identity primary key,
  user_id   uuid references auth.users not null,
  date      date not null,
  bpm       real not null
);

create table workouts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  activity_type text not null,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  duration_min  real,
  calories      real,
  distance_mi   real,
  distance_km   real,
  elevation_m   real,
  flights       real
);

create table vo2max (
  id        bigint generated always as identity primary key,
  user_id   uuid references auth.users not null,
  timestamp timestamptz not null,
  value     real not null
);

-- RLS policies
alter table heart_rate_samples enable row level security;
create policy "Users see own data" on heart_rate_samples
  for all using (auth.uid() = user_id);
-- (repeat for each table)
```

### Incremental Import Strategy
1. On upload, compute SHA-256 of the file
2. Check `health_uploads` for a matching hash — if found, skip (already imported)
3. Parse the file client-side (existing parser)
4. Diff against existing data: find the latest timestamp per data type already in the DB
5. Insert only records newer than the latest existing timestamp
6. Record the upload in `health_uploads`

This means the first upload processes everything, but subsequent uploads only add new data since the last export.

---

## Option B: GCP

### When GCP Makes Sense
- Already using GCP professionally, so the mental model and tooling are familiar
- If this project grows beyond personal use (multi-tenant, high throughput)
- If we need services Supabase doesn't offer (BigQuery analytics, Cloud Run for heavy compute, Pub/Sub for event pipelines)

### GCP Stack
| Service | Role | Free tier |
|---|---|---|
| Cloud SQL (Postgres) | Database | None — starts at ~$7/mo for the smallest instance |
| Cloud Run | API server | 2M requests/mo free |
| Cloud Storage | File uploads | 5 GB free |
| Firebase Auth | Authentication | Free for most methods |
| Identity Platform | Alternative auth | Free tier available |

### Cost Comparison
- **Supabase Free:** $0/mo for everything we need right now
- **GCP Minimum:** ~$7-10/mo just for Cloud SQL, plus additional costs for Cloud Run if it exceeds free tier
- **Break-even point:** GCP becomes competitive only if we need >8 GB database or services Supabase doesn't offer

### Downsides for This Project
- More infrastructure to manage (Cloud SQL doesn't auto-configure RLS, auth, or APIs)
- Need to write and deploy an API layer (Cloud Run or Cloud Functions)
- No built-in admin dashboard (Supabase has a web UI for tables, auth, logs)
- Overkill for a single-user personal project

---

## Recommendation

**Start with Supabase.** The free tier covers our needs, auth and RLS come out of the box, and the JS client eliminates the need for a custom API. If the project outgrows Supabase (unlikely for a personal dashboard), migration to GCP Postgres is straightforward since both run standard Postgres.

### Migration Path (if needed)
1. `pg_dump` the Supabase database
2. `pg_restore` into Cloud SQL
3. Replace `@supabase/supabase-js` calls with a Cloud Run API
4. Replace Supabase Auth with Firebase Auth
5. Update RLS policies to application-level auth checks

The schema is standard Postgres — no Supabase-specific features that would lock us in.

---

## Implementation Steps

1. Create a Supabase project (free tier)
2. Run the schema migration above
3. Add `@supabase/supabase-js` to the frontend
4. Build an auth flow (sign up / sign in / sign out)
5. On successful upload + parse, write data to Supabase instead of (or in addition to) holding it in React state
6. On app load, fetch the user's data from Supabase if authenticated
7. Add incremental import logic
8. Test multi-device access
