-- ─── 1. user_id sur les commandes ───────────────────────────────────────────
alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_id_idx on orders(user_id);

-- ─── 2. Table product_reviews (≠ reviews existante qui est pour commandes) ──
create table if not exists product_reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  reviewer_name text,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz default now(),
  unique(product_id, user_id)
);
alter table product_reviews enable row level security;
create policy "Anyone reads product_reviews"     on product_reviews for select using (true);
create policy "Auth users insert product_review" on product_reviews for insert with check (auth.uid() = user_id);
create policy "Users update own product_review"  on product_reviews for update using (auth.uid() = user_id);
create policy "Users delete own product_review"  on product_reviews for delete using (auth.uid() = user_id);
create index if not exists product_reviews_product_id_idx on product_reviews(product_id);

-- ─── 3. Table profiles ───────────────────────────────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name  text,
  phone      text,
  address    text,
  gender     text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users and admin select profiles" on profiles for select
  using (auth.uid() = id OR (auth.jwt() ->> 'email') = 'guineemakiti224@gmail.com');
create policy "Users insert own profile"        on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile"        on profiles for update using (auth.uid() = id);

-- Trigger : crée le profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id) values (new.id) on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
