'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/src/types';
import { generateWhatsAppLink } from '@/src/lib/whatsapp';
import { formatPrice } from '@/src/lib/formatters';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, price, promo_price, image_url, stock, slug } = product;
  const isOutOfStock = stock === 0;
  const hasPromo = promo_price !== undefined && promo_price < price;

  const whatsappHref = generateWhatsAppLink([{ product, quantity: 1 }]);

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col"
      whileHover={
        !isOutOfStock
          ? { scale: 1.02, boxShadow: '0 12px 32px rgba(232,0,28,0.12)' }
          : undefined
      }
      transition={{ duration: 0.18, ease: 'easeOut' as const }}
    >
      {/* Image */}
      <Link
        href={`/produit/${slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-4xl">
            🛍️
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-gray-400 text-white">
              RUPTURE
            </span>
          )}
          {hasPromo && !isOutOfStock && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-jaune text-noir">
              PROMO
            </span>
          )}
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link href={`/produit/${slug}`}>
          <p className="text-sm font-semibold text-noir leading-snug line-clamp-2 hover:text-rouge transition-colors">
            {name}
          </p>
        </Link>

        {/* Prix */}
        <div className="flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="font-bold text-rouge">{formatPrice(promo_price!)}</span>
              <span className="text-xs text-gray-400 line-through">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="font-bold text-rouge">{formatPrice(price)}</span>
          )}
        </div>

        {/* Bouton Commander */}
        <div className="mt-auto pt-1">
          <a
            href={isOutOfStock ? undefined : whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={isOutOfStock}
            className={`flex w-full items-center justify-center rounded-full py-2.5 text-sm font-bold text-white transition-opacity ${
              isOutOfStock
                ? 'bg-gray-300 pointer-events-none cursor-not-allowed'
                : 'bg-vert hover:opacity-90'
            }`}
          >
            {isOutOfStock ? 'Rupture de stock' : '🛒 Commander'}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
