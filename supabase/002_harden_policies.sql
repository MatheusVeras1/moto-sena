create schema if not exists private;
revoke all on schema private from anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "admins manage motos" on public.motos;
create policy "admins insert motos"
on public.motos
for insert
to authenticated
with check (private.is_admin());

create policy "admins update motos"
on public.motos
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "admins delete motos"
on public.motos
for delete
to authenticated
using (private.is_admin());

drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins insert settings"
on public.site_settings
for insert
to authenticated
with check (private.is_admin());

create policy "admins update settings"
on public.site_settings
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "admins delete settings"
on public.site_settings
for delete
to authenticated
using (private.is_admin());

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders"
on public.orders
for select
to authenticated
using (private.is_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders"
on public.orders
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "admins read analytics" on public.analytics_events;
create policy "admins read analytics"
on public.analytics_events
for select
to authenticated
using (private.is_admin());

drop policy if exists "admins read own profile" on public.admin_profiles;
create policy "admins read own profile"
on public.admin_profiles
for select
to authenticated
using (user_id = auth.uid());

create index if not exists orders_moto_id_idx on public.orders (moto_id);
create index if not exists site_settings_featured_moto_id_idx on public.site_settings (featured_moto_id);

drop function if exists public.is_admin();
