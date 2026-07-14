create table if not exists public.inventory (
  moto_id text primary key references public.motos(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  moto_id text not null references public.motos(id) on delete cascade,
  movement_type text not null check (
    movement_type in ('entrada', 'saida', 'ajuste', 'venda', 'estorno_venda')
  ),
  delta integer not null,
  previous_quantity integer not null check (previous_quantity >= 0),
  new_quantity integer not null check (new_quantity >= 0),
  note text not null default '',
  order_id uuid references public.orders(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text not null default '',
  created_at timestamptz not null default now()
);

insert into public.inventory (moto_id, quantity)
select id, 0 from public.motos
on conflict (moto_id) do nothing;

create index if not exists stock_movements_moto_created_idx
on public.stock_movements (moto_id, created_at desc);

create index if not exists stock_movements_created_idx
on public.stock_movements (created_at desc);

create index if not exists stock_movements_order_idx
on public.stock_movements (order_id)
where order_id is not null;

alter table public.inventory enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "admins read inventory" on public.inventory;
create policy "admins read inventory"
on public.inventory for select to authenticated
using (private.is_admin());

drop policy if exists "admins read stock movements" on public.stock_movements;
create policy "admins read stock movements"
on public.stock_movements for select to authenticated
using (private.is_admin());

revoke all on public.inventory, public.stock_movements from anon;
revoke insert, update, delete on public.inventory, public.stock_movements from authenticated;
grant select on public.inventory, public.stock_movements to authenticated;

create or replace function private.inventory_for_new_moto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inventory (moto_id, quantity)
  values (new.id, 0)
  on conflict (moto_id) do nothing;
  return new;
end;
$$;

drop trigger if exists motos_create_inventory on public.motos;
create trigger motos_create_inventory
after insert on public.motos
for each row execute function private.inventory_for_new_moto();

create or replace function public.apply_stock_movement(
  p_moto_id text,
  p_type text,
  p_quantity integer,
  p_note text default ''
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous integer;
  v_new integer;
  v_delta integer;
  v_email text;
begin
  if not private.is_admin() then
    raise exception 'NOT_AUTHORIZED' using errcode = '42501';
  end if;

  if p_type not in ('entrada', 'saida', 'ajuste') then
    raise exception 'INVALID_MOVEMENT_TYPE' using errcode = '22023';
  end if;
  if p_quantity < 0 or (p_type <> 'ajuste' and p_quantity = 0) then
    raise exception 'INVALID_QUANTITY' using errcode = '22023';
  end if;
  if p_type = 'ajuste' and btrim(coalesce(p_note, '')) = '' then
    raise exception 'ADJUSTMENT_NOTE_REQUIRED' using errcode = '22023';
  end if;

  insert into public.inventory (moto_id, quantity)
  values (p_moto_id, 0)
  on conflict (moto_id) do nothing;

  select quantity into v_previous
  from public.inventory
  where moto_id = p_moto_id
  for update;

  v_new := case p_type
    when 'entrada' then v_previous + p_quantity
    when 'saida' then v_previous - p_quantity
    else p_quantity
  end;

  if v_new < 0 then
    raise exception 'INSUFFICIENT_STOCK' using errcode = 'P0001';
  end if;

  v_delta := v_new - v_previous;
  if v_delta = 0 then
    return v_new;
  end if;

  update public.inventory
  set quantity = v_new, updated_at = now()
  where moto_id = p_moto_id;

  select email into v_email
  from public.admin_profiles
  where user_id = auth.uid();

  insert into public.stock_movements (
    moto_id, movement_type, delta, previous_quantity, new_quantity,
    note, actor_id, actor_email
  ) values (
    p_moto_id, p_type, v_delta, v_previous, v_new,
    btrim(coalesce(p_note, '')), auth.uid(), coalesce(v_email, 'Administrador')
  );

  return v_new;
end;
$$;

create or replace function public.update_order_status_with_stock(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_previous integer;
  v_new integer;
  v_email text;
  v_last_movement text;
begin
  if not private.is_admin() then
    raise exception 'NOT_AUTHORIZED' using errcode = '42501';
  end if;
  if p_status not in ('novo', 'atendimento', 'vendido', 'perdido') then
    raise exception 'INVALID_ORDER_STATUS' using errcode = '22023';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_order.status = p_status then
    return;
  end if;

  select email into v_email
  from public.admin_profiles
  where user_id = auth.uid();

  if v_order.status <> 'vendido' and p_status = 'vendido' then
    insert into public.inventory (moto_id, quantity)
    values (v_order.moto_id, 0)
    on conflict (moto_id) do nothing;

    select quantity into v_previous
    from public.inventory
    where moto_id = v_order.moto_id
    for update;

    if v_previous < 1 then
      raise exception 'INSUFFICIENT_STOCK' using errcode = 'P0001';
    end if;

    v_new := v_previous - 1;
    update public.inventory set quantity = v_new, updated_at = now()
    where moto_id = v_order.moto_id;

    insert into public.stock_movements (
      moto_id, movement_type, delta, previous_quantity, new_quantity,
      note, order_id, actor_id, actor_email
    ) values (
      v_order.moto_id, 'venda', -1, v_previous, v_new,
      'Baixa automática pelo pedido vendido.', v_order.id, auth.uid(),
      coalesce(v_email, 'Administrador')
    );
  elsif v_order.status = 'vendido' and p_status <> 'vendido' then
    select movement_type into v_last_movement
    from public.stock_movements
    where order_id = v_order.id
    order by created_at desc
    limit 1;

    -- Pedidos que já estavam vendidos antes desta migration não tiveram baixa.
    if v_last_movement = 'venda' then
      insert into public.inventory (moto_id, quantity)
      values (v_order.moto_id, 0)
      on conflict (moto_id) do nothing;

      select quantity into v_previous
      from public.inventory
      where moto_id = v_order.moto_id
      for update;

      v_new := coalesce(v_previous, 0) + 1;
      update public.inventory set quantity = v_new, updated_at = now()
      where moto_id = v_order.moto_id;

      insert into public.stock_movements (
        moto_id, movement_type, delta, previous_quantity, new_quantity,
        note, order_id, actor_id, actor_email
      ) values (
        v_order.moto_id, 'estorno_venda', 1, coalesce(v_previous, 0), v_new,
        'Estorno automático após alteração do pedido.', v_order.id, auth.uid(),
        coalesce(v_email, 'Administrador')
      );
    end if;
  end if;

  update public.orders set status = p_status where id = p_order_id;
end;
$$;

revoke all on function public.apply_stock_movement(text, text, integer, text) from public, anon;
revoke all on function public.update_order_status_with_stock(uuid, text) from public, anon;
grant execute on function public.apply_stock_movement(text, text, integer, text) to authenticated;
grant execute on function public.update_order_status_with_stock(uuid, text) to authenticated;
