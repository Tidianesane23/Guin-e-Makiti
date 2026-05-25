import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/src/lib/supabase';
import type { Order, OrderStatus, CartItem } from '@/src/types';

export interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  items: CartItem[];
  total_amount: number;
  notes?: string;
}

export interface OrderStats {
  total:     number;
  revenue:   number;
  byStatus:  Record<OrderStatus, number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(row: any): Order {
  return {
    id:             row.id,
    customer_name:  row.customer_name,
    customer_phone: row.customer_phone,
    items:          row.items ?? [],
    total:          row.total_amount,
    status:         row.status as OrderStatus,
    notes:          row.notes,
    created_at:     row.created_at,
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
  const { data, error } = await db(client)
    .from('orders')
    .insert({
      customer_name:  formData.customer_name,
      customer_phone: formData.customer_phone,
      items:          formData.items,
      total_amount:   formData.total_amount,
      notes:          formData.notes,
      status:         'en_attente',
    })
    .select()
    .single();

  if (error) throw error;
  return mapOrder(data);
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
