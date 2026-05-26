import type { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guinee-makiti.com';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url:              SITE_URL,
    lastModified:     new Date(),
    changeFrequency:  'daily',
    priority:         1.0,
  },
  {
    url:              `${SITE_URL}/boutique`,
    lastModified:     new Date(),
    changeFrequency:  'daily',
    priority:         0.9,
  },
  {
    url:              `${SITE_URL}/categories`,
    lastModified:     new Date(),
    changeFrequency:  'weekly',
    priority:         0.8,
  },
  {
    url:              `${SITE_URL}/contact`,
    lastModified:     new Date(),
    changeFrequency:  'monthly',
    priority:         0.5,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServerClient();

  // Produits actifs
  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Catégories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')
    .order('"order"', { ascending: true });

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url:             `${SITE_URL}/produit/${p.slug}`,
    lastModified:    new Date(p.created_at),
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url:             `${SITE_URL}/boutique?categorie=${c.slug}`,
    lastModified:    new Date(c.created_at),
    changeFrequency: 'weekly' as const,
    priority:        0.7,
  }));

  return [...STATIC_PAGES, ...productEntries, ...categoryEntries];
}
