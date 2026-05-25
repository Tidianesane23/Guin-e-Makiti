'use client';

import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/src/types';
import ProductCard from '@/src/components/ui/ProductCard';
import SkeletonCard from '@/src/components/ui/SkeletonCard';
import Button from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReset: () => void;
}

export default function ProductGrid({
  products,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onReset,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Search size={52} className="text-gray-200" />
        <div>
          <p className="text-lg font-semibold text-noir">Aucun produit trouvé</p>
          <p className="mt-1 text-sm text-gray-500">Essayez d&apos;autres filtres</p>
        </div>
        <Button variant="secondary" onClick={onReset}>
          Réinitialiser les filtres
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): number[] {
  const count = Math.min(5, total);
  let start = Math.max(1, current - 2);
  const end = Math.min(total, start + count - 1);
  // adjust start when near the end
  start = Math.max(1, end - count + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages = getPageNumbers(current, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      {/* Précédent */}
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Page précédente"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-noir hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === current ? 'page' : undefined}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
            p === current
              ? 'bg-rouge text-white'
              : 'border border-gray-200 text-noir hover:bg-gray-100',
          )}
        >
          {p}
        </button>
      ))}

      {/* Suivant */}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Page suivante"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-noir hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
