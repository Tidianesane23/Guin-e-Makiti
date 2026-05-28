-- ─── Table messages litige ───────────────────────────────────────────────────
create table if not exists dispute_messages (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  sender     text not null check (sender in ('client', 'admin')),
  content    text,
  file_url   text,
  file_name  text,
  created_at timestamptz default now()
);

alter table dispute_messages enable row level security;

create policy "Public read dispute_messages"
  on dispute_messages for select using (true);

create policy "Public insert dispute_messages"
  on dispute_messages for insert with check (true);

create policy "Admin delete dispute_messages"
  on dispute_messages for delete using (auth.role() = 'authenticated');

create index dispute_messages_order_id_idx on dispute_messages(order_id);

-- ─── Bucket Supabase Storage pour les fichiers de litige ─────────────────────
insert into storage.buckets (id, name, public)
  values ('dispute-files', 'dispute-files', true)
  on conflict (id) do nothing;

create policy "Public read dispute files"
  on storage.objects for select using (bucket_id = 'dispute-files');

create policy "Public upload dispute files"
  on storage.objects for insert
  with check (bucket_id = 'dispute-files');
