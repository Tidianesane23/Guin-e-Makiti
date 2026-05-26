import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/src/lib/supabase';

export interface Review {
  id: string;
  order_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_names?: string;
  created_at: string;
}

export interface ReviewFormData {
  order_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_names?: string;
}

function db(client?: SupabaseClient) {
  return client ?? browserClient;
}

export async function submitReview(data: ReviewFormData, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('reviews').insert(data);
  if (error) throw new Error(`${error.code}: ${error.message} — ${error.details ?? ''} ${error.hint ?? ''}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(r: any): Review {
  return {
    id:            r.id,
    order_id:      r.order_id,
    customer_name: r.customer_name,
    rating:        r.rating,
    comment:       r.comment,
    product_names: r.product_names ?? undefined,
    created_at:    r.created_at,
  };
}

export async function getPublishedReviews(limit = 6, client?: SupabaseClient): Promise<Review[]> {
  const { data, error } = await db(client)
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map(mapReview);
}

export async function getPendingReviews(client?: SupabaseClient): Promise<Review[]> {
  const { data, error } = await db(client)
    .from('reviews')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapReview);
}

export async function getAllReviews(client?: SupabaseClient): Promise<(Review & { approved: boolean })[]> {
  const { data, error } = await db(client)
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...mapReview(r), approved: r.approved ?? false }));
}

export async function approveReview(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('reviews').update({ approved: true }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteReview(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
