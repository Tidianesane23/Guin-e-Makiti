-- Cancel reason on orders
alter table orders add column if not exists cancel_reason text;

-- Increment stock RPC (symmetric to decrement_stock)
create or replace function increment_stock(
  product_id   uuid,
  qty          integer,
  variant_name text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock    integer;
  v_names    text[];
  v_stocks   integer[];
  v_idx      integer;
begin
  select stock, variant_names, variant_stocks
    into v_stock, v_names, v_stocks
    from products
    where id = product_id
    for update;

  if not found then
    raise exception 'Product not found: %', product_id;
  end if;

  if variant_name is not null and v_names is not null and array_length(v_names, 1) > 0 then
    v_idx := array_position(v_names, variant_name);
    if v_idx is not null then
      v_stocks[v_idx] := v_stocks[v_idx] + qty;
      update products
        set stock = v_stock + qty, variant_stocks = v_stocks
        where id = product_id;
      return v_stock + qty;
    end if;
  end if;

  update products
    set stock = v_stock + qty
    where id = product_id;

  return v_stock + qty;
end;
$$;
