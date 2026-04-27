insert into storage.buckets (id, name, public)
values ('ux-assets', 'ux-assets', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read ux-assets'
  ) then
    create policy "Public can read ux-assets"
    on storage.objects
    for select
    to anon
    using (bucket_id = 'ux-assets');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can upload ux-assets'
  ) then
    create policy "Public can upload ux-assets"
    on storage.objects
    for insert
    to anon
    with check (bucket_id = 'ux-assets');
  end if;
end $$;
