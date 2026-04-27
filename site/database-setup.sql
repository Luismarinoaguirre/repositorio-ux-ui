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
  file_path text default '',
  file_public_url text default '',
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

alter table public.ux_resources
  add column if not exists file_path text default '';

alter table public.ux_resources
  add column if not exists file_public_url text default '';

alter table public.ux_resources enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ux_resources'
      and policyname = 'Public can read published resources'
  ) then
    create policy "Public can read published resources"
    on public.ux_resources
    for select
    to anon
    using (status = 'published');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ux_resources'
      and policyname = 'Public can insert published resources'
  ) then
    create policy "Public can insert published resources"
    on public.ux_resources
    for insert
    to anon
    with check (status = 'published');
  end if;
end $$;
