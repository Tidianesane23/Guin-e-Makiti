'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronLeft, faChevronRight } from '@/src/lib/icons';
import { getProductsAdmin } from '@/src/lib/services/products.service';
import { getCategories } from '@/src/lib/services/categories.service';
import { deleteProduct, toggleProductActive } from '@/src/lib/services/products.service';
import { formatPrice } from '@/src/lib/formatters';
import { cn } from '@/src/lib/utils';
import type { Product, Category } from '@/src/types';
import Button from '@/src/components/ui/Button';
import SearchBar from '@/src/components/shop/SearchBar';

const ITEMS_PER_PAGE = 10;

export default function ProduitsAdminPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page,         setPage]         = useState(1);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getProductsAdmin({ limit: 500 }),
      getCategories(),
    ])
      .then(([{ data }, cats]) => {
        setProducts(data);
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (catFilter !== 'all' && p.category_id !== catFilter) return false;
      if (statusFilter === 'active'   && !p.is_active) return false;
      if (statusFilter === 'inactive' &&  p.is_active) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, catFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteId);
      setProducts((ps) => ps.filter((p) => p.id !== deleteId));
    } catch { /* ignore */ }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await toggleProductActive(id, !current);
      setProducts((ps) => ps.map((p) => p.id === id ? { ...p, is_active: !current } : p));
    } catch { /* ignore */ }
  };

  const stockColor = (s: number) =>
    s === 0 ? 'text-rouge font-semibold' : s < 5 ? 'text-orange-500 font-semibold' : 'text-green-600';

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Rechercher..."
            className="w-56"
          />
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rouge"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white text-sm">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn(
                  'px-3 py-2 font-medium transition-colors',
                  statusFilter === s ? 'bg-noir text-white' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                {{ all: 'Tous', active: 'Actifs', inactive: 'Inactifs' }[s]}
              </button>
            ))}
          </div>
        </div>
        <Link href="/admin/produits/nouveau">
          <Button variant="primary" iconLeft={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 16 }} />}>
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : paginated.map((p, i) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className={i < paginated.length - 1 ? 'border-b border-gray-50' : ''}>
                      <td className="px-4 py-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                          {p.image_url && (
                            <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        <p className="font-medium text-noir line-clamp-1">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{cat?.name ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-noir">
                        {p.promo_price ? (
                          <span>
                            <span className="text-rouge">{formatPrice(p.promo_price)}</span>{' '}
                            <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>
                          </span>
                        ) : formatPrice(p.price)}
                      </td>
                      <td className={`px-4 py-3 ${stockColor(p.stock)}`}>{p.stock}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(p.id, p.is_active)}
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-70',
                            p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          {p.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/produits/${p.id}`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-noir transition-colors"
                            aria-label="Modifier"
                          >
                            <FontAwesomeIcon icon={faEdit} style={{ fontSize: 15 }} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-rouge transition-colors"
                            aria-label="Supprimer"
                          >
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: 15 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400">
              {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-noir disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 14 }} />
              </button>
              <span className="px-2 text-sm font-medium text-noir">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-noir disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-bold text-noir">Supprimer ce produit ?</h3>
            <p className="mt-1 text-sm text-gray-500">Cette action est irréversible.</p>
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button
                variant="primary"
                fullWidth
                className="bg-rouge"
                loading={deleting}
                onClick={handleDelete}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
