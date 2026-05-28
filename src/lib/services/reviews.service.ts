import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/src/lib/supabase';

function db(client?: SupabaseClient) { return client ?? browserClient; }

// ─── Legacy order reviews (table: reviews) ────────────────────────────────────

export interface Review {
  id:            string;
  order_id:      string;
  customer_name: string;
  rating:        number;
  comment:       string | null;
  product_names: string | null;
  approved:      boolean;
  created_at:    string;
}

export interface OrderReviewData {
  order_id:      string;
  customer_name: string;
  rating:        number;
  comment:       string;
  product_names?: string;
}

export async function submitReview(data: OrderReviewData, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client)
    .from('reviews')
    .insert({
      order_id:      data.order_id,
      customer_name: data.customer_name,
      rating:        data.rating,
      comment:       data.comment,
      product_names: data.product_names ?? null,
    });
  if (error) throw error;
}

export async function getAllReviews(client?: SupabaseClient): Promise<Review[]> {
  const { data, error } = await db(client)
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedReviews(limit = 10, client?: SupabaseClient): Promise<Review[]> {
  const { data, error } = await db(client)
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

export async function approveReview(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('reviews').update({ approved: true }).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('reviews').delete().eq('id', id);
  if (error) throw error;
}

// ─── Product reviews (table: product_reviews) ────────────────────────────────

export interface ProductReview {
  id:            string;
  product_id:    string;
  user_id:       string;
  reviewer_name: string | null;
  rating:        number;
  comment:       string | null;
  created_at:    string;
}

export async function getProductReviews(productId: string, client?: SupabaseClient): Promise<ProductReview[]> {
  const { data, error } = await db(client)
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getUserReview(productId: string, userId: string, client?: SupabaseClient): Promise<ProductReview | null> {
  const { data, error } = await db(client)
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertReview(
  productId: string,
  userId: string,
  reviewerName: string,
  rating: number,
  comment: string,
  client?: SupabaseClient,
): Promise<ProductReview> {
  const { data, error } = await db(client)
    .from('product_reviews')
    .upsert(
      { product_id: productId, user_id: userId, reviewer_name: reviewerName, rating, comment },
      { onConflict: 'product_id,user_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductReview(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('product_reviews').delete().eq('id', id);
  if (error) throw error;
}

export async function getProductRating(productId: string, client?: SupabaseClient): Promise<{ avg: number; count: number }> {
  const { data, error } = await db(client)
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId);
  if (error) return { avg: 0, count: 0 };
  const rows = data ?? [];
  if (rows.length === 0) return { avg: 0, count: 0 };
  const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
  return { avg: Math.round(avg * 10) / 10, count: rows.length };
}
