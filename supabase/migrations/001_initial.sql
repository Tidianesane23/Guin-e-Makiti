-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Table : categories ───────────────────────────────────────────────────────
create table categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text unique not null,
  image_url  text,
  "order"    integer default 0,
  created_at timestamp with time zone default now()
);

-- ─── Table : products ─────────────────────────────────────────────────────────
create table products (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text unique not null,
  description     text,
  price           numeric not null,
  promo_price     numeric,
  effective_price numeric generated always as (coalesce(promo_price, price)) stored,
  category_id     uuid references categories(id) on delete set null,
  images          text[] default '{}',
  stock           integer default 0,
  is_active       boolean default true,
  is_featured     boolean default false,
  characteristics jsonb default '{}',
  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone default now()
);

-- ─── Table : orders ───────────────────────────────────────────────────────────
create table orders (
  id              uuid primary key default uuid_generate_v4(),
  customer_name   text not null,
  customer_phone  text not null,
  items           jsonb not null default '[]',
  total_amount    numeric not null,
  status          text default 'en_attente'
    check (status in ('en_attente','confirme','en_livraison','livre','annule')),
  notes           text,
  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone default now()
);

-- ─── Trigger : updated_at automatique ────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ─── Index ────────────────────────────────────────────────────────────────────
create index products_category_id_idx on products(category_id);
create index products_is_active_idx   on products(is_active);
create index products_is_featured_idx on products(is_featured);
create index products_slug_idx        on products(slug);
create index orders_status_idx        on orders(status);
create index orders_created_at_idx    on orders(created_at desc);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table categories enable row level security;
alter table products    enable row level security;
alter table orders      enable row level security;

-- Lecture publique
create policy "Public read categories"
  on categories for select using (true);

create policy "Public read active products"
  on products for select using (is_active = true);

-- Écriture admin uniquement (authentifié)
create policy "Admin all categories"
  on categories for all using (auth.role() = 'authenticated');

create policy "Admin all products"
  on products for all using (auth.role() = 'authenticated');

create policy "Admin all orders"
  on orders for all using (auth.role() = 'authenticated');

-- Insertion commande publique (panier WhatsApp)
create policy "Public insert orders"
  on orders for insert with check (true);

-- ─── Storage : bucket product-images ─────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "Public read product images"
  on storage.objects for select using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ─── Seed : 6 catégories ─────────────────────────────────────────────────────
insert into categories (name, slug, "order") values
  ('Smartphones',    'smartphones',    1),
  ('Accessoires',    'accessoires',    2),
  ('Audio',          'audio',          3),
  ('Électroménager', 'electromenager', 4),
  ('Mode',           'mode',           5),
  ('Beauté',         'beaute',         6);
