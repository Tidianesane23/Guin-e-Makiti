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
