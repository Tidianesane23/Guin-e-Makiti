import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/src/lib/supabase';
import type { Order, OrderStatus, CartItem } from '@/src/types';

export interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: CartItem[];
  total_amount: number;
  notes?: string;
  user_id?: string;
}

export interface OrderStats {
  total:     number;
  revenue:   number;
  byStatus:  Record<OrderStatus, number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(row: any): Order {
  return {
    id:                 row.id,
    customer_name:      row.customer_name,
    customer_phone:     row.customer_phone,
    customer_email:     row.customer_email ?? undefined,
    items:              row.items ?? [],
    total:              row.total_amount,
    status:             row.status as OrderStatus,
    notes:              row.notes,
    cancel_reason:      row.cancel_reason  ?? undefined,
    dispute_reason:     row.dispute_reason ?? undefined,
    dispute_proof:      row.dispute_proof  ?? undefined,
    customer_confirmed: row.customer_confirmed ?? false,
    created_at:         row.created_at,
  };
}

function db(client?: SupabaseClient) {
  return client ?? browserClient;
}

export async function getOrders(
  filters: { status?: OrderStatus; page?: number; limit?: number } = {},
  client?: SupabaseClient,
): Promise<{ data: Order[]; count: number }> {
  const { status, page = 1, limit = 20 } = filters;

  let query = db(client)
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data: (data ?? []).map(mapOrder), count: count ?? 0 };
}

export async function createOrder(formData: OrderFormData, client?: SupabaseClient): Promise<Order> {
  // UUID généré côté client pour éviter le .select() après insert
  // (la politique RLS n'autorise pas la lecture publique des commandes)
  const id  = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error } = await db(client)
    .from('orders')
    .insert({
      id,
      customer_name:  formData.customer_name,
      customer_phone: formData.customer_phone,
      items:          formData.items,
      total_amount:   formData.total_amount,
      notes:          formData.notes,
      status:         'en_attente',
      ...(formData.customer_email ? { customer_email: formData.customer_email } : {}),
      ...(formData.user_id ? { user_id: formData.user_id } : {}),
    });

  if (error) throw error;

  return {
    id,
    customer_name:      formData.customer_name,
    customer_phone:     formData.customer_phone,
    customer_email:     formData.customer_email,
    items:              formData.items,
    total:              formData.total_amount,
    status:             'en_attente',
    notes:              formData.notes,
    customer_confirmed: false,
    created_at:         now,
  };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  client?: SupabaseClient,
): Promise<Order> {
  const { data, error } = await db(client)
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapOrder(data);
}

export async function getOrdersByIds(ids: string[], client?: SupabaseClient): Promise<Order[]> {
  if (ids.length === 0) return [];
  const { data, error } = await db(client)
    .from('orders')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}

export async function getOrdersByUserId(userId: string, client?: SupabaseClient): Promise<Order[]> {
  const { data, error } = await db(client)
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}

export async function getOrdersByPhone(phone: string, client?: SupabaseClient): Promise<Order[]> {
  const clean = phone.replace(/\D/g, '');
  if (!clean) return [];
  const { data, error } = await db(client)
    .from('orders')
    .select('*')
    .eq('customer_phone', clean)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}

export async function cancelOrder(id: string, reason: string): Promise<boolean> {
  // Utilise le RPC security-definer pour bypasser la RLS anon
  const { data, error } = await browserClient.rpc('cancel_order_public', {
    order_id: id,
    reason:   reason.trim(),
  });
  if (error) throw error;
  return data === true;
}

export async function addDispute(id: string, reason: string): Promise<boolean> {
  const { data, error } = await browserClient.rpc('report_dispute_public', {
    order_id: id,
    reason:   reason.trim(),
  });
  if (error) throw error;
  return data === true;
}

export async function resolveDispute(
  id: string,
  proof: string,
  client?: SupabaseClient,
): Promise<void> {
  const { error } = await db(client)
    .from('orders')
    .update({ dispute_proof: proof.trim() })
    .eq('id', id);
  if (error) throw error;
}

export async function confirmCustomerReceipt(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client)
    .from('orders')
    .update({ customer_confirmed: true })
    .eq('id', id);
  if (error) throw error;
}

export async function getOrderStats(client?: SupabaseClient): Promise<OrderStats> {
  const { data, error } = await db(client)
    .from('orders')
    .select('status, total_amount');

  if (error) throw error;

  const rows = data ?? [];
  const total   = rows.length;
  const revenue = rows.reduce((sum, r) => sum + (r.total_amount ?? 0), 0);

  const byStatus = {
    en_attente: 0, confirme: 0, en_livraison: 0, livre: 0, annule: 0,
  } as Record<OrderStatus, number>;

  rows.forEach((r) => {
    const s = r.status as OrderStatus;
    if (s in byStatus) byStatus[s]++;
  });

  return { total, revenue, byStatus };
}
