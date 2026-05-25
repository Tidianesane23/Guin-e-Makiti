import Link from 'next/link';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getCategories } from '@/src/lib/services/categories.service';

const EMOJI_MAP: Record<string, string> = {
  smartphones:    '📱',
  accessoires:    '🎧',
  audio:          '🔊',
  electromenager: '🏠',
  mode:           '👗',
  beaute:         '✨',
};

export const metadata = {
  title: 'Catégories — Guinée Makiti',
  description: 'Parcourez toutes les catégories de produits disponibles sur Guinée Makiti.',
};

export default async function CategoriesPage() {
  const supabase   = await createSupabaseServerClient();
  const categories = await getCategories(supabase).catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-noir md:text-4xl">Catégories</h1>
          <p className="mt-2 text-gray-500">Explorez nos produits par catégorie</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/boutique?categorie=${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-5xl">{EMOJI_MAP[cat.slug] ?? '🛍️'}</span>
              <div className="text-center">
                <p className="font-bold text-noir group-hover:text-rouge transition-colors">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
