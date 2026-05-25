'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { getProducts } from '@/src/lib/services/products.service';
import { getCategories } from '@/src/lib/services/categories.service';
import type { Product, Category } from '@/src/types';
import SearchBar from '@/src/components/shop/SearchBar';
import SortSelect from '@/src/components/shop/SortSelect';
import FiltersSidebar from '@/src/components/shop/FiltersSidebar';
import ProductGrid from '@/src/components/shop/ProductGrid';
import SkeletonCard from '@/src/components/ui/SkeletonCard';

const ITEMS_PER_PAGE = 12;

type SortBy    = 'newest' | 'price_asc' | 'price_desc' | 'popular';
type PriceRange = 'all'   | 'under_500k' | '500k_1m' | 'over_1m';

// ─── Inner component (uses useSearchParams) ──────────────────────────────────

function BoutiqueContent() {
  const searchParams = useSearchParams();

  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('categorie') ?? 'all',
  );
  const [sortBy,        setSortBy]        = useState<SortBy>('newest');
  const [priceRange,    setPriceRange]    = useState<PriceRange>('all');
  const [inStockOnly,   setInStockOnly]   = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [products,    setProducts]   = useState<Product[]>([]);
  const [categories,  setCategories] = useState<Category[]>([]);
  const [totalCount,  setTotalCount] = useState(0);
  const [isLoading,   setIsLoading]  = useState(true);

  // ── Fetch categories once ─────────────────────────────────
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // ── Fetch products from Supabase ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getProducts({
      categorySlug: selectedCategory === 'all' ? undefined : selectedCategory,
      search:       searchQuery || undefined,
      sort:         sortBy,
      priceRange:   priceRange === 'all' ? undefined : priceRange,
      inStockOnly:  inStockOnly || undefined,
      page:         currentPage,
      limit:        ITEMS_PER_PAGE,
    })
      .then(({ data, count }) => {
        if (!cancelled) {
          setProducts(data);
          setTotalCount(count);
          setIsLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [searchQuery, selectedCategory, sortBy, priceRange, inStockOnly, currentPage]);

  // ── Handlers that also reset pagination ──────────────────
  const handleSearchChange   = (q: string)    => { setSearchQuery(q);              setCurrentPage(1); };
  const handleCategoryChange = (slug: string) => { setSelectedCategory(slug);      setCurrentPage(1); };
  const handlePriceChange    = (r: string)    => { setPriceRange(r as PriceRange); setCurrentPage(1); };
  const handleInStockChange  = (v: boolean)   => { setInStockOnly(v);              setCurrentPage(1); };
  const handleSortChange     = (v: string)    => { setSortBy(v as SortBy);         setCurrentPage(1); };

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setInStockOnly(false);
    setCurrentPage(1);
  }, []);

  const totalPages       = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasActiveFilters = selectedCategory !== 'all' || priceRange !== 'all' || inStockOnly;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-noir md:text-3xl">Boutique</h1>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading ? '…' : `${totalCount} produit${totalCount !== 1 ? 's' : ''} trouvé${totalCount !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Mobile filters button */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-noir hover:bg-gray-50 transition-colors md:hidden"
            >
              <SlidersHorizontal size={16} />
              Filtres
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rouge" />
              )}
            </button>
          </div>

          {/* Search + Sort */}
          <div className="mt-4 flex gap-3">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1"
            />
            <SortSelect value={sortBy} onChange={handleSortChange} />
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <FiltersSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedPrice={priceRange}
            onPriceChange={handlePriceChange}
            inStockOnly={inStockOnly}
            onInStockChange={handleInStockChange}
            onReset={handleReset}
            hasActiveFilters={hasActiveFilters}
            isSheetOpen={isFiltersOpen}
            onSheetClose={() => setIsFiltersOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function BoutiqueSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-4 flex gap-3">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-10 w-40 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Page export (wraps in Suspense for useSearchParams) ─────────────────────

export default function BoutiquePage() {
  return (
    <Suspense fallback={<BoutiqueSkeleton />}>
      <BoutiqueContent />
    </Suspense>
  );
}
