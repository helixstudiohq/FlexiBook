-- ════════════════════════════════════════════════════════════════════
-- FlexiBook · Supabase schema
-- Run this in Supabase Dashboard → SQL Editor.
-- ═════════════════════════════ URL ─═════════════════════════════════

create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  service_id    text        not null,
  service_name  text        not null,
  customer_name text        not null,
  customer_email text       not null,
  customer_phone text       not null default '',
  booking_date  date        not null,
  booking_time  text        not null,           -- HH:mm (24h)
  notes         text        not null default '',
  status        text        not null default 'pending'
                  check (status in ('pending', 'confirmed', 'cancelled')),
  created_at    timestamptz not null default now()
);

create index if not exists bookings_date_idx
  on public.bookings (booking_date);
create index if not exists bookings_status_idx
  on public.bookings (status);
create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);

-- ── Row Level Security ──────────────────────────────────────────────
-- Public demo policy: anon clients may read and insert bookings and
-- update only the status column. Tighten to authenticated users for
-- production use.
alter table public.bookings enable row level security;

drop policy if exists "Public read bookings" on public.bookings;
drop policy if exists "Public insert bookings" on public.bookings;
drop policy if exists "Public update status" on public.bookings;

create policy "Public read bookings"
  on public.bookings for select to anon, authenticated using (true);

create policy "Public insert bookings"
  on public.bookings for insert to anon, authenticated with check (true);

create policy "Public update status"
  on public.bookings for update to anon, authenticated
  using (true) with check (true);

-- ── Seed data ───────────────────────────────────────────────────────
insert into public.bookings
  (service_id, service_name, customer_name, customer_email, customer_phone, booking_date, booking_time, notes, status)
values
  ('ui-ux-design',        'UI/UX Design Sprint',     'Amelia Hart',  'amelia.hart@example.com',  '+1 (415) 555-0132', (current_date + 1)::text, '10:00', 'Focus on the onboarding flow redesign.', 'confirmed'),
  ('strategy-consultation','Strategy Consultation',  'Noah Bennett', 'noah.bennett@example.com', '+1 (628) 555-0198', (current_date + 2)::text, '13:30', '',                                        'pending'),
  ('seo-audit',           'SEO & Analytics Audit',   'Lena Moreau',  'lena.moreau@example.com',  '+1 (302) 555-0117', (current_date - 1)::text, '15:00', 'E-commerce store, 40+ SKUs.',             'cancelled'),
  ('web-development',     'Web Development Session', 'Diego Ramos',  'diego.ramos@example.com',  '+1 (212) 555-0144', current_date::text,       '11:00', 'Checkout page performance work.',         'confirmed')
on conflict do nothing;
