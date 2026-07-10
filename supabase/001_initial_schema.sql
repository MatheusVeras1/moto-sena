create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.motos (
  id text primary key,
  name text not null,
  short_name text not null,
  price numeric(12,2),
  promo_price numeric(12,2),
  active boolean not null default true,
  sort_order integer not null default 0,
  tagline text not null,
  description text not null,
  video text not null,
  hero_video text,
  poster text not null,
  specs text[] not null default '{}',
  highlights text[] not null default '{}',
  caution text,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'main',
  banner text not null default '',
  featured_moto_id text not null references public.motos(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  moto_id text not null references public.motos(id),
  moto_name text not null,
  payment text not null,
  delivery text not null,
  buyer_name text,
  buyer_phone text,
  buyer_city text,
  status text not null default 'novo' check (status in ('novo', 'atendimento', 'vendido', 'perdido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  moto_id text,
  session_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists motos_touch_updated_at on public.motos;
create trigger motos_touch_updated_at
before update on public.motos
for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.motos enable row level security;
alter table public.site_settings enable row level security;
alter table public.orders enable row level security;
alter table public.analytics_events enable row level security;

create or replace function public.is_admin()
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

drop policy if exists "public read active motos" on public.motos;
create policy "public read active motos"
on public.motos
for select
to anon, authenticated
using (active = true);

drop policy if exists "admins manage motos" on public.motos;
create policy "admins manage motos"
on public.motos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins manage settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders"
on public.orders
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "service inserts orders" on public.orders;
create policy "service inserts orders"
on public.orders
for insert
to service_role
with check (true);

drop policy if exists "admins read analytics" on public.analytics_events;
create policy "admins read analytics"
on public.analytics_events
for select
to authenticated
using (public.is_admin());

drop policy if exists "service inserts analytics" on public.analytics_events;
create policy "service inserts analytics"
on public.analytics_events
for insert
to service_role
with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.motos, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.motos, public.site_settings to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.analytics_events to authenticated;
grant execute on function public.is_admin() to authenticated;

insert into public.motos (
  id, name, short_name, price, active, sort_order, tagline, description,
  video, hero_video, poster, specs, highlights, caution
) values
  ('mini-bob-500w', 'Mini Bob 500W', 'Mini Bob', null, true, 10, 'Compacta, prÃ¡tica e forte para cidade.', 'Modelo urbano para quem quer agilidade, facilidade de manobra e bom desempenho em trajetos curtos.', '/api/videos/motos/mini-bob-500w', '/api/videos/hero-modelos/mini-bob-500w', '/videos/posters/mini-bob-500w.webp', array['Motor 500W','Compacta','Boa em subidas'], array['FÃ¡cil de manobrar','Forte para a categoria','Ideal para uso rÃ¡pido'], null),
  ('bob-max-1000w', 'Bob Max 1000W', 'Bob Max', null, true, 20, 'Conforto e potÃªncia para rotina e trabalho.', 'Scooter elÃ©trica versÃ¡til para uso diÃ¡rio, trabalho e delivery, com foco em conforto prolongado.', '/api/videos/motos/bob-max-1000w', '/api/videos/hero-modelos/bob-max-1000w', '/videos/posters/bob-max-1000w.webp', array['Motor 1000W','Alta autonomia','Uso diÃ¡rio'], array['Conforto prolongado','Boa para delivery','Pode vir com baÃº'], null),
  ('x11-1000w', 'X11 1000W', 'X11', null, true, 30, 'EconÃ´mica, completa e pronta para o dia a dia.', 'Scooter elÃ©trica com Bluetooth, painel digital e rÃ©, pensada para quem quer economia sem perder conforto.', '/api/videos/motos/x11-1000w', '/api/videos/hero-modelos/x11-1000w', '/videos/posters/x11-1000w.webp', array['AtÃ© 45 km','AtÃ© 32 km/h','RÃ©'], array['Bluetooth','Painel digital','Conforto diÃ¡rio'], null),
  ('one-max-1000w', 'One Max 1000W', 'One Max', null, true, 40, 'ForÃ§a para subida e uso urbano mais pesado.', 'Modelo robusto para quem busca estabilidade, resistÃªncia e potÃªncia real para trajetos mais exigentes.', '/api/videos/motos/one-max-1000w', '/api/videos/hero-modelos/one-max-1000w', '/videos/posters/one-max-1000w.webp', array['Motor 1000W','EstÃ¡vel','Uso pesado'], array['Ideal para subida','Conforto em distÃ¢ncia','Estrutura resistente'], null),
  ('ttx-1000w', 'TTX 1000W', 'TTX', null, true, 50, 'Design esportivo com eficiÃªncia urbana.', 'Visual moderno, painel digital e conduÃ§Ã£o leve para quem quer uma scooter com mais presenÃ§a.', '/api/videos/motos/ttx-1000w', '/api/videos/hero-modelos/ttx-1000w', '/videos/posters/ttx-1000w.webp', array['AtÃ© 32 km/h','Painel digital','Design esportivo'], array['Visual moderno','ConduÃ§Ã£o leve','Estilo e eficiÃªncia'], null),
  ('x13-1000w', 'X13 1000W', 'X13', null, true, 60, 'Tecnologia, conforto e pacote completo.', 'Scooter elÃ©trica com bateria 60V 20Ah, NFC, Bluetooth, rÃ©, alarme e freios a disco.', '/api/videos/motos/x13-1000w', '/api/videos/hero-modelos/x13-1000w', '/videos/posters/x13-1000w.webp', array['60V 20Ah','AtÃ© 50 km','AtÃ© 180 kg'], array['NFC e Bluetooth','RÃ© + alarme','Freio a disco'], 'Consulte as condiÃ§Ãµes do modelo e enquadramento antes de publicar promessas legais.'),
  ('yep-1000w', 'YEP 1000W', 'YEP', null, true, 70, 'Alta autonomia para quem roda muito.', 'Scooter elÃ©trica com foco em autonomia, conforto e tecnologia para longas distÃ¢ncias urbanas.', '/api/videos/motos/yep-1000w', '/api/videos/hero-modelos/yep-1000w', '/videos/posters/yep-1000w.webp', array['Motor 1000W','AtÃ© 120 km','Bluetooth'], array['Banco confortÃ¡vel','Longas distÃ¢ncias','Uso intenso no dia'], 'Velocidade e enquadramento devem ser confirmados antes de comunicaÃ§Ã£o final.'),
  ('v9-max-1000w', 'V9 Max 1000W', 'V9 Max', null, true, 80, 'PotÃªncia, conforto e presenÃ§a urbana.', 'Modelo forte e moderno para trajetos diÃ¡rios, com conduÃ§Ã£o confortÃ¡vel e visual de destaque.', '/api/videos/motos/v9-max-1000w', '/api/videos/hero-modelos/v9-max-1000w', '/videos/posters/v9-max-1000w.webp', array['Motor 1000W','Uso urbano','ConfortÃ¡vel'], array['PresenÃ§a forte','Boa estabilidade','Rotina diÃ¡ria'], 'PreÃ§o, bateria e autonomia devem ser confirmados na unidade.')
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  price = excluded.price,
  sort_order = excluded.sort_order,
  tagline = excluded.tagline,
  description = excluded.description,
  video = excluded.video,
  hero_video = excluded.hero_video,
  poster = excluded.poster,
  specs = excluded.specs,
  highlights = excluded.highlights,
  caution = excluded.caution;

insert into public.site_settings (id, banner, featured_moto_id)
values ('main', '', 'x13-1000w')
on conflict (id) do nothing;
