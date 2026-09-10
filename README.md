# FlexiBook

**Smart Scheduling Made Effortless.** A high-converting, interactive booking platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, and Supabase.

## Features

- **Landing page** (`/`) — gradient hero, live demo badge, dual CTAs, glowing service cards with price/category/duration, features and testimonials.
- **Booking wizard** (`/book`) — 3-step flow: Choose Service → Date & Time slot grid (available / booked / past indicators, skeleton loading) → Details with real-time validation and a live summary. Persists every booking into the Supabase `bookings` table.
- **Dashboard** (`/dashboard`) — status widgets (Total / Confirmed / Pending / Cancelled), searchable + filterable appointment table with color-coded badges (Pending yellow, Confirmed emerald, Cancelled rose) and quick action menus with optimistic updates.
- Glassmorphic dark/slate theme, entrance micro-animations, hover scale effects, loading skeletons, fully responsive (mobile → desktop).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase credentials
npm run dev
```

Open http://localhost:3000.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql) — it creates the `bookings` table with indexes, RLS policies, and seed rows.
3. Copy **Project Settings → API** values into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Without credentials the app still runs fully interactive in **demo mode**: bookings are stored in your browser so you can try the entire flow.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

## Offline install fallback

If `npm install` stalls on an unreliable network, `vendor.mjs` can rebuild `node_modules` from resumable per-package downloads:

```bash
node vendor.mjs enumerate   # resolve the dependency tree (cached, retrying)
node vendor.mjs download    # resumable tarball downloads into vendor/tarballs
node vendor.mjs extract     # extract into node_modules/
node vendor.mjs shims       # recreate node_modules/.bin launchers
```

## Project structure

```
src/
  app/                  # Routes: / , /book , /dashboard
  components/
    landing/            # Hero, ServiceGrid, Features/Testimonials
    book/               # Wizard, steps, success screen
    dashboard/          # StatCards, BookingsTable, DashboardClient
    layout/             # Navbar, Footer
    shared/             # Icon registry, animation helpers
  lib/                  # supabase.ts, bookings data layer, slots, types
supabase/schema.sql     # Table + RLS + seed data
```
