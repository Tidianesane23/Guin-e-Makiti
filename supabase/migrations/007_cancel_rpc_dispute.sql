-- ─── 1. RPC cancel_order_public (security definer → bypass RLS anon) ────────
create or replace function cancel_order_public(
  order_id uuid,
  reason   text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status from orders where id = order_id;

  if not found then
    return false;
  end if;

  -- Ne pas toucher aux états finaux
  if v_status in ('livre', 'annule') then
    return false;
  end if;

  update orders
    set status = 'annule', cancel_reason = reason
    where id = order_id;

  return true;
end;
$$;

grant execute on function cancel_order_public(uuid, text) to anon, authenticated;

-- ─── 2. GRANT explicite sur increment_stock (anon + authenticated) ────────────
grant execute on function increment_stock(uuid, integer, text) to anon, authenticated;

-- ─── 3. Colonnes litige ───────────────────────────────────────────────────────
alter table orders add column if not exists dispute_reason text;
alter table orders add column if not exists dispute_proof  text;
