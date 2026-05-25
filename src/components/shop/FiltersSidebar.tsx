'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import type { Category } from '@/src/types';
import Button from '@/src/components/ui/Button';

const PRICE_RANGES = [
  { value: 'under_500k', label: 'Moins de 500K' },
  { value: '500k_1m',    label: '500K – 1M'     },
  { value: 'over_1m',    label: 'Plus de 1M'     },
] as const;

interface FiltersSidebarProps {
  categories?: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  selectedPrice: string;
  onPriceChange: (range: string) => void;
  inStockOnly: boolean;
  onInStockChange: (v: boolean) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  isSheetOpen?: boolean;
  onSheetClose?: () => void;
}

export default function FiltersSidebar(props: FiltersSidebarProps) {
  const { isSheetOpen = false, onSheetClose } = props;

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:block w-[280px] shrink-0">
        <div className="sticky top-[88px]">
          <FilterContent {...props} />
        </div>
      </aside>

      {/* ── Mobile bottom sheet ── */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onSheetClose}
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              className="fixed bottom-0 left-0 right-0 z-[60] flex max-h-[85dvh] flex-col rounded-t-2xl bg-white shadow-2xl md:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Filtres"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-gray-300" />
              </div>
              <p className="px-5 pb-3 text-base font-bold text-noir">Filtres</p>
              <div className="flex-1 overflow-y-auto px-5 pb-4">
                <FilterContent {...props} />
              </div>
              <div className="border-t border-gray-100 p-4">
                <Button variant="primary" fullWidth onClick={onSheetClose}>
                  Appliquer les filtres
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterContent({
  categories = [],
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  inStockOnly,
  onInStockChange,
  onReset,
  hasActiveFilters,
}: FiltersSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Catégories ── */}
      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Catégories
        </h3>
        <ul className="flex flex-col gap-1">
          <li>
            <FilterButton
              active={selectedCategory === 'all'}
              onClick={() => onCategoryChange('all')}
            >
              Toutes les catégories
            </FilterButton>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <FilterButton
                active={selectedCategory === cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
              >
                {cat.name}
              </FilterButton>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Prix ── */}
      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Prix (GNF)
        </h3>
        <div className="flex flex-col gap-1">
          {PRICE_RANGES.map((r) => (
            <FilterButton
              key={r.value}
              active={selectedPrice === r.value}
              onClick={() => onPriceChange(selectedPrice === r.value ? 'all' : r.value)}
            >
              {r.label}
            </FilterButton>
          ))}
        </div>
      </section>

      {/* ── Disponibilité ── */}
      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Disponibilité
        </h3>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-rouge cursor-pointer"
          />
          <span className="text-sm text-noir">En stock uniquement</span>
        </label>
      </section>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="w-fit text-sm font-medium text-rouge hover:opacity-70 transition-opacity"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 text-left',
        active
          ? 'border border-rouge bg-rouge/5 text-rouge'
          : 'text-gray-700 hover:bg-gray-100',
      )}
    >
      {children}
    </button>
  );
}
