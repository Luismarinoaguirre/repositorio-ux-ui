create extension if not exists pgcrypto;

create table if not exists public.ux_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  section text not null,
  section_title text not null,
  group_slug text not null,
  group_title text not null,
  url text not null,
  note text default '',
  file_name text default '',
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

alter table public.ux_resources enable row level security;

create policy "Public can read published resources"
on public.ux_resources
for select
to anon
using (status = 'published');

create policy "Public can insert published resources"
on public.ux_resources
for insert
to anon
with check (status = 'published');
