-- Colonne statut du litige
alter table orders add column if not exists dispute_status text
  check (dispute_status in ('open', 'admin_resolved', 'client_confirmed'));

-- Marquer les litiges existants comme ouverts
update orders
  set dispute_status = 'open'
  where dispute_reason is not null and dispute_status is null;

-- RPC : client confirme ou rejette la résolution de l'admin
create or replace function confirm_dispute_resolution(
  order_id  uuid,
  confirmed boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
    set dispute_status = case when confirmed then 'client_confirmed' else 'open' end
    where id = order_id and dispute_status = 'admin_resolved';
  return found;
end;
$$;

grant execute on function confirm_dispute_resolution(uuid, boolean) to anon, authenticated;
