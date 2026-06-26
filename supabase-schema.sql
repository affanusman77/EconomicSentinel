-- ============================================================
-- Economic Sentinel — Supabase table schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Join the Team applications
create table if not exists join_applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  email       text not null,
  whatsapp    text not null,
  institution text not null,
  help_with   text[] default '{}',
  why         text not null,
  hours       text not null,
  available   text not null,
  portfolio   text default '',
  anything_else text default '',
  status      text default 'new' check (status in ('new', 'reviewed', 'accepted', 'declined'))
);

-- 2. Research Internship applications
create table if not exists internship_applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  email       text not null,
  whatsapp    text not null,
  location    text not null,
  institution text not null,
  module      text not null,
  why_module  text not null,
  experience  text default '',
  can_commit  text not null,
  hear_about  text default '',
  fee_waiver  text not null,
  status      text default 'new' check (status in ('new', 'reviewed', 'accepted', 'declined'))
);

-- 3. Row Level Security — allow public inserts, restrict reads
alter table join_applications enable row level security;
alter table internship_applications enable row level security;

-- Anyone can submit (insert) via the anon key
create policy "Allow public insert" on join_applications
  for insert to anon with check (true);

create policy "Allow public insert" on internship_applications
  for insert to anon with check (true);

-- Allow reads via anon key (dashboard is protected by Cloudflare Access at the route level)
create policy "Allow anon read" on join_applications
  for select to anon using (true);

create policy "Allow anon read" on internship_applications
  for select to anon using (true);

-- Allow status updates via anon key (dashboard route is protected at infra level)
create policy "Allow status update" on join_applications
  for update to anon using (true) with check (true);

create policy "Allow status update" on internship_applications
  for update to anon using (true) with check (true);
