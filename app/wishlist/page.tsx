'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartBroken, faShoppingBag } from '@/src/lib/icons';
import { useWishlist } from '@/src/hooks/useWishlist';
import { getProductsByIds } from '@/src/lib/services/products.service';
import ProductCard from '@/src/components/ui/ProductCard';
import type { Product } from '@/src/types';

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductsByIds(ids)
      .then((data) => { if (!cancelled) setProducts(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ids]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-noir md:text-3xl">Mes favoris</h1>
          <p className="mt-1 text-sm text-gray-500">
            {ids.length > 0
              ? `${ids.length} article${ids.length > 1 ? 's' : ''} sauvegardé${ids.length > 1 ? 's' : ''}`
              : "Aucun favori pour l'instant"
            }
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <FontAwesomeIcon icon={faHeartBroken} style={{ fontSize: 56, color: '#D1D5DB' }} />
            <div>
              <p className="text-lg font-semibold text-noir">Votre liste de favoris est vide</p>
              <p className="mt-1 text-sm text-gray-400">
                Cliquez sur le ♥ d'un produit pour le sauvegarder ici.
              </p>
            </div>
            <Link
              href="/boutique"
              className="mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#C8860A' }}
            >
              <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 14 }} />
              Voir la boutique
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
