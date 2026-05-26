import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/src/lib/supabase';
import type { Product, Category } from '@/src/types';

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  priceRange?: 'all' | 'under_500k' | '500k_1m' | 'over_1m';
  inStockOnly?: boolean;
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  promo_price?: number;
  category_id: string;
  images: string[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  characteristics: Record<string, string>;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(row: any): Product {
  return {
    id:              row.id,
    slug:            row.slug,
    name:            row.name,
    description:     row.description ?? '',
    price:           row.price,
    promo_price:     row.promo_price ?? undefined,
    image_url:       (row.images as string[])?.[0] ?? '',
    images:          row.images ?? [],
    category_id:     row.category_id,
    category:        row.category as Category | undefined,
    stock:           row.stock,
    is_active:       row.is_active,
    is_featured:     row.is_featured ?? false,
    characteristics: row.characteristics ?? {},
    created_at:      row.created_at,
  };
}

function db(client?: SupabaseClient) {
  return client ?? browserClient;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {},
  client?: SupabaseClient,
): Promise<{ data: Product[]; count: number }> {
  const {
    categorySlug,
    search,
    sort = 'newest',
    priceRange,
    inStockOnly,
    page = 1,
    limit = 12,
    activeOnly = true,
  } = filters;

  let query = db(client)
    .from('products')
    .select('*, category:categories(id, name, slug, image_url, created_at)', { count: 'exact' });

  if (activeOnly) query = query.eq('is_active', true);
  if (inStockOnly) query = query.gt('stock', 0);
  if (search)      query = query.ilike('name', `%${search}%`);

  if (categorySlug) {
    const { data: cat } = await db(client)
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (!cat) return { data: [], count: 0 };
    query = query.eq('category_id', cat.id);
  }

  if (priceRange && priceRange !== 'all') {
    if (priceRange === 'under_500k')
      query = query.lt('effective_price', 500_000);
    else if (priceRange === '500k_1m')
      query = query.gte('effective_price', 500_000).lte('effective_price', 1_000_000);
    else if (priceRange === 'over_1m')
      query = query.gt('effective_price', 1_000_000);
  }

  switch (sort) {
    case 'price_asc':  query = query.order('effective_price', { ascending: true });  break;
    case 'price_desc': query = query.order('effective_price', { ascending: false }); break;
    case 'popular':    query = query.order('stock', { ascending: false });            break;
    default:           query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data: (data ?? []).map(mapProduct), count: count ?? 0 };
}

export async function getProductBySlug(slug: string, client?: SupabaseClient): Promise<Product | null> {
  const { data, error } = await db(client)
    .from('products')
    .select('*, category:categories(id, name, slug, image_url, created_at)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return mapProduct(data);
}

export async function getFeaturedProducts(limit = 8, client?: SupabaseClient): Promise<Product[]> {
  const { data, error } = await db(client)
    .from('products')
    .select('*, category:categories(id, name, slug, image_url, created_at)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
  client?: SupabaseClient,
): Promise<Product[]> {
  const { data, error } = await db(client)
    .from('products')
    .select('*, category:categories(id, name, slug, image_url, created_at)')
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

// ── Admin queries (pas de filtre is_active) ───────────────────────────────────

export async function getProductsAdmin(
  filters: Omit<ProductFilters, 'activeOnly'> = {},
  client?: SupabaseClient,
): Promise<{ data: Product[]; count: number }> {
  return getProducts({ ...filters, activeOnly: false }, client);
}

export async function getProductById(id: string, client?: SupabaseClient): Promise<Product | null> {
  const { data, error } = await db(client)
    .from('products')
    .select('*, category:categories(id, name, slug, image_url, created_at)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapProduct(data);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createProduct(formData: ProductFormData, client?: SupabaseClient): Promise<Product> {
  const { data, error } = await db(client)
    .from('products')
    .insert(formData)
    .select()
    .single();

  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  formData: Partial<ProductFormData>,
  client?: SupabaseClient,
): Promise<Product> {
  const { data, error } = await db(client)
    .from('products')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(id: string, client?: SupabaseClient): Promise<void> {
  const { error } = await db(client).from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleProductActive(
  id: string,
  is_active: boolean,
  client?: SupabaseClient,
): Promise<void> {
  const { error } = await db(client)
    .from('products')
    .update({ is_active })
    .eq('id', id);
  if (error) throw error;
}

export async function decrementStock(
  productId: string,
  quantity: number,
): Promise<{ success: boolean; newStock: number }> {
  const { data, error } = await browserClient.rpc('decrement_stock', {
    product_id: productId,
    qty: quantity,
  });

  if (error) {
    console.error('[decrementStock] RPC error:', error.message, error.code, error.details);
    return { success: false, newStock: 0 };
  }
  if (data === null || data === undefined) {
    console.error('[decrementStock] RPC returned null for product', productId);
    return { success: false, newStock: 0 };
  }
  return { success: true, newStock: data as number };
}

export async function getLowStockProducts(
  threshold = 5,
  client?: SupabaseClient,
): Promise<Product[]> {
  const { data, error } = await db(client)
    .from('products')
    .select('*, category:categories(id, name, slug, image_url, created_at)')
    .eq('is_active', true)
    .gt('stock', 0)
    .lte('stock', threshold)
    .order('stock', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}
