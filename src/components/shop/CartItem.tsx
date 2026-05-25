'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/src/types';
import { formatPrice } from '@/src/lib/formatters';
import Badge from '@/src/components/ui/Badge';

interface CartItemCardProps {
  item: CartItem;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItemCard({ item, onUpdate, onRemove }: CartItemCardProps) {
  const { product, quantity } = item;
  const { name, price, promo_price, image_url, slug, stock } = product;
  const effectivePrice = promo_price ?? price;
  const hasPromo = promo_price !== undefined && promo_price < price;

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
        <Image src={image_url} alt={name} fill className="object-cover" sizes="80px" />
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
            <Trash2 size={16} />
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
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-noir">{quantity}</span>
            <button
              onClick={() => onUpdate(quantity + 1)}
              disabled={quantity >= stock}
              aria-label="Augmenter la quantité"
              className="flex h-8 w-8 items-center justify-center text-noir transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <Plus size={14} />
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
