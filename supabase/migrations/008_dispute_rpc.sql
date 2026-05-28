-- RPC pour signaler un litige (bypass RLS anon)
create or replace function report_dispute_public(
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

  -- Litige uniquement sur commandes livrées, et une seule fois
  if v_status <> 'livre' then
    return false;
  end if;

  update orders
    set dispute_reason = reason
    where id = order_id and dispute_reason is null;

  return true;
end;
$$;

grant execute on function report_dispute_public(uuid, text) to anon, authenticated;
