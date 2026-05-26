'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faTrash } from '@/src/lib/icons';
import type { CartItem } from '@/src/types';
import { formatPrice } from '@/src/lib/formatters';
import Badge from '@/src/components/ui/Badge';

interface CartItemCardProps {
  item: CartItem;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItemCard({ item, onUpdate, onRemove }: CartItemCardProps) {
  const { product, quantity, variant } = item;
  const { name, price, promo_price, slug } = product;
  const effectivePrice = promo_price ?? price;
  const hasPromo = promo_price !== undefined && promo_price < price;

  const variantIdx = variant
    ? (product.variant_names ?? []).indexOf(variant)
    : -1;
  const displayImage = variantIdx >= 0
    ? (product.images?.[variantIdx] ?? product.image_url)
    : product.image_url;
  const effectiveStock = variantIdx >= 0 && product.variant_stocks?.length
    ? (product.variant_stocks[variantIdx] ?? product.stock)
    : product.stock;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100%' }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
      className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm"
    >
      {/* Image */}
      <Link
        href={`/produit/${slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100"
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #F7D9C4, #FCE7DC)' }} />
        )}
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/produit/${slug}`}
              className="line-clamp-2 text-sm font-semibold leading-snug text-noir transition-colors hover:text-rouge"
            >
              {name}
            </Link>
            {variant && (
              <span className="mt-0.5 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {variant}
              </span>
            )}
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-sm font-medium ${hasPromo ? 'text-rouge' : 'text-gray-600'}`}>
                {formatPrice(effectivePrice)}
              </span>
              {hasPromo && <Badge variant="promo" />}
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={onRemove}
            aria-label={`Supprimer ${name} du panier`}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rouge/5 hover:text-rouge"
          >
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: 16 }} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity selector */}
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => onUpdate(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Diminuer la quantité"
              className="flex h-8 w-8 items-center justify-center text-noir transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faMinus} style={{ fontSize: 14 }} />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-noir">{quantity}</span>
            <button
              onClick={() => onUpdate(quantity + 1)}
              disabled={quantity >= effectiveStock}
              aria-label="Augmenter la quantité"
              className="flex h-8 w-8 items-center justify-center text-noir transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} />
            </button>
          </div>

          {/* Line total */}
          <span className="text-base font-bold text-rouge">
            {formatPrice(effectivePrice * quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
