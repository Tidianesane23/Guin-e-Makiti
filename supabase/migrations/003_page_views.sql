-- Suivi des vues de pages produits
create table page_views (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  slug       text,
  viewed_at  timestamp with time zone default now()
);

alter table page_views enable row level security;

create policy "Public insert page_views"
  on page_views for insert with check (true);

create policy "Admin read page_views"
  on page_views for select using (auth.role() = 'authenticated');

create index page_views_product_id_idx on page_views(product_id);
create index page_views_viewed_at_idx  on page_views(viewed_at desc);
