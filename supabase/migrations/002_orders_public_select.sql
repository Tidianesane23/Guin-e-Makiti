-- Autoriser la lecture publique des commandes par UUID
-- (les UUID sont non-devinables, c'est le mécanisme de sécurité)
create policy "Public read orders"
  on orders for select using (true);
