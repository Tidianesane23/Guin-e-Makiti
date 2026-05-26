import Link from 'next/link';
import type { Metadata } from 'next';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faHeadphones, faVolumeUp, faHome, faTshirt, faGem, faShoppingBag } from '@/src/lib/icons';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getCategoriesWithCounts } from '@/src/lib/services/categories.service';

export const metadata: Metadata = {
  title: 'Catégories — Guinée Makiti',
  description: 'Parcourez toutes les catégories de produits disponibles sur Guinée Makiti.',
};

const ICON_MAP: Record<string, IconDefinition> = {
  smartphones:    faMobileAlt,
  accessoires:    faHeadphones,
  audio:          faVolumeUp,
  electromenager: faHome,
  mode:           faTshirt,
  beaute:         faGem,
};

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  smartphones:    { bg: 'rgba(200,134,10,0.12)',  color: '#C8860A' },
  accessoires:    { bg: 'rgba(0,99,201,0.1)',     color: '#0063C9' },
  audio:          { bg: 'rgba(0,153,68,0.1)',     color: '#009944' },
  electromenager: { bg: 'rgba(232,0,28,0.1)',     color: '#E8001C' },
  mode:           { bg: 'rgba(155,89,182,0.1)',   color: '#9B59B6' },
  beaute:         { bg: 'rgba(231,76,60,0.1)',    color: '#E74C3C' },
};

const DEFAULT_COLOR = { bg: 'rgba(44,26,26,0.08)', color: '#7A4A3A' };

export default async function CategoriesPage() {
  const supabase   = await createSupabaseServerClient();
  const categories = await getCategoriesWithCounts(supabase).catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-noir md:text-4xl">Nos Catégories</h1>
          <p className="mt-2 text-gray-500">Explorez nos produits par catégorie</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 56, color: '#D1D5DB' }} />
            <p className="text-gray-400">Aucune catégorie disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((cat) => {
              const icon  = ICON_MAP[cat.slug] ?? faShoppingBag;
              const color = COLOR_MAP[cat.slug] ?? DEFAULT_COLOR;
              return (
                <Link
                  key={cat.id}
                  href={`/boutique?categorie=${cat.slug}`}
                  className="group flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
                    style={{ background: color.bg }}
                  >
                    <FontAwesomeIcon icon={icon} style={{ fontSize: 28, color: color.color }} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-noir transition-colors group-hover:text-rouge">
                      {cat.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {cat.productCount} produit{cat.productCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
