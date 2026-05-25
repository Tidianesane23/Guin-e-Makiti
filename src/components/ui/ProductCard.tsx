'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/src/types';
import { generateWhatsAppLink } from '@/src/lib/whatsapp';
import { formatPrice } from '@/src/lib/formatters';
import { cn } from '@/src/lib/utils';
import Badge from './Badge';

interface ProductCardProps {
  product: Product;
}

const actionBase =
  'flex-1 inline-flex items-center justify-center rounded-lg text-sm font-semibold py-1.5 px-3 transition-all duration-200';

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
          ? { scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
          : undefined
      }
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Image */}
      <Link
        href={`/produit/${slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
      >
        <Image
          src={image_url}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && <Badge variant="rupture" />}
          {hasPromo && !isOutOfStock && <Badge variant="promo" />}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-sm font-semibold text-noir leading-snug line-clamp-2">
          {name}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="font-bold text-rouge">{formatPrice(promo_price!)}</span>
              <span className="text-xs text-gray-400 line-through">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="font-bold text-noir">{formatPrice(price)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/produit/${slug}`}
            className={cn(
              actionBase,
              'border-2 border-rouge text-rouge hover:bg-rouge hover:text-white',
            )}
          >
            Voir
          </Link>
          <a
            href={isOutOfStock ? undefined : whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={isOutOfStock}
            className={cn(
              actionBase,
              'bg-[#25D366] text-white hover:opacity-90',
              isOutOfStock && 'opacity-50 pointer-events-none',
            )}
          >
            Commander
          </a>
        </div>
      </div>
    </motion.div>
  );
}
