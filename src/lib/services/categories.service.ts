import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/src/lib/supabase';
import type { Category } from '@/src/types';

export interface CategoryFormData {
  name: string;
  slug: string;
  image_url?: string;
  order?: number;
}

function db(client?: SupabaseClient) {
  return client ?? browserClient;
}

export async function getCategories(client?: SupabaseClient): Promise<Category[]> {
  const { data, error } = await db(client)
    .from('categories')
    .select('*')
    .order('"order"', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  formData: CategoryFormData,
  client?: SupabaseClient,
): Promise<Category> {
  const { data, error } = await db(client)
    .from('categories')
    .insert(formData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  formData: Partial<CategoryFormData>,
  client?: SupabaseClient,
): Promise<Category> {
  const { data, error } = await db(client)
    .from('categories')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function getCategoriesWithCounts(
  client?: SupabaseClient,
): Promise<(Category & { productCount: number })[]> {
  const [categories, { data: productRows }] = await Promise.all([
    getCategories(client),
    db(client).from('products').select('category_id').eq('is_active', true),
  ]);

  const countMap: Record<string, number> = {};
  for (const row of productRows ?? []) {
    countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1;
  }

  return categories.map((cat) => ({ ...cat, productCount: countMap[cat.id] ?? 0 }));
}
