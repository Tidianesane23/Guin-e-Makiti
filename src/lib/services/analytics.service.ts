import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/src/lib/supabase';

function db(client?: SupabaseClient) {
  return client ?? browserClient;
}

export async function trackProductView(productId: string, slug: string): Promise<void> {
  await db().from('page_views').insert({ product_id: productId, slug });
}

export async function getViewStats(
  client?: SupabaseClient,
): Promise<{ total7d: number; topProducts: { slug: string; name: string; count: number }[] }> {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await db(client)
    .from('page_views')
    .select('slug, product_id, products(name)')
    .gte('viewed_at', since.toISOString());

  if (error || !data) return { total7d: 0, topProducts: [] };

  const total7d = data.length;

  const countMap = new Map<string, { name: string; count: number }>();
  for (const row of data) {
    const key  = row.slug ?? '';
    const name = (row.products as { name?: string } | null)?.name ?? key;
    const prev = countMap.get(key) ?? { name, count: 0 };
    countMap.set(key, { name, count: prev.count + 1 });
  }

  const topProducts = [...countMap.entries()]
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { total7d, topProducts };
}
