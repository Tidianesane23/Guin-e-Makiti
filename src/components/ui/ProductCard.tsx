'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHeart } from '@/src/lib/icons';
import { Product } from '@/src/types';
import { formatPrice } from '@/src/lib/formatters';
import Button from './Button';
import StockIndicator from './StockIndicator';
import QuickOrderModal from '@/src/components/shop/QuickOrderModal';
import { useWishlist } from '@/src/hooks/useWishlist';

interface ProductCardProps { product: Product; dark?: boolean; }

export default function ProductCard({ product, dark = false }: ProductCardProps) {
  const { name, price, promo_price, image_url, stock, slug, images } = product;
  const hasPromo = promo_price !== undefined && promo_price < price;

  const { toggle: toggleWish, isWished } = useWishlist();
  const wished = isWished(product.id);

  const allImages = (images && images.length > 0) ? images : image_url ? [image_url] : [];
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [localStock,  setLocalStock]  = useState(stock);
  const [showModal,   setShowModal]   = useState(false);
  const currentIdxRef = useRef(0);

  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);

  // Auto-play
  useEffect(() => {
    if (allImages.length <= 1) return;
    const id = setInterval(() => {
      const next = (currentIdxRef.current + 1) % allImages.length;
      setCurrentIdx(next);
    }, 3500);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allImages.length]);

  const isOutOfStock = localStock === 0;

  const handleModalClose = (newStock?: number) => {
    setShowModal(false);
    if (newStock !== undefined) setLocalStock(newStock);
  };

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-2xl"
      whileHover={!isOutOfStock ? { y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' as const }}
      style={{
        background:   dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)',
        border:       dark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(44,26,26,0.1)',
        borderRadius: 16,
      }}
    >
      {/* Image carousel */}
      <Link href={`/produit/${slug}`} className="relative block overflow-hidden h-32 md:h-44">
        {allImages.length > 0 ? (
          allImages.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={i === 0 ? name : `${name} — vue ${i + 1}`}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-300 group-hover:scale-[1.08] ${i === currentIdx ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
            />
          ))
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #F7D9C4, #FCE7DC)' }}
          />
        )}

        <div
          className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.15))' }}
        />

        {allImages.length > 1 && (
          <div className="absolute bottom-1.5 left-0 right-0 z-10 flex justify-center gap-1 pointer-events-none">
            {allImages.map((_, i) => (
              <span
                key={i}
                className="inline-block rounded-full"
                style={{
                  width:      4,
                  height:     4,
                  background: i === currentIdx ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>
        )}

        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isOutOfStock && (
            <span
              className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
              style={{ background: 'rgba(44,26,26,0.12)', color: dark ? 'rgba(255,255,255,0.6)' : '#7A4A3A' }}
            >
              Rupture
            </span>
          )}
          {hasPromo && !isOutOfStock && (
            <span
              className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ background: '#C8860A' }}
            >
              Promo
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); toggleWish(product.id); }}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all"
          style={{ background: wished ? 'rgba(192,57,43,0.9)' : 'rgba(0,0,0,0.35)' }}
          aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <FontAwesomeIcon icon={faHeart} style={{ fontSize: 12, color: '#fff' }} />
        </button>
      </Link>

      {/* Infos */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link href={`/produit/${slug}`}>
          <p
            className="text-xs md:text-sm font-semibold leading-snug line-clamp-2 hover:text-or transition-colors"
            style={{ color: dark ? 'rgba(255,255,255,0.9)' : '#2C1A1A' }}
          >
            {name}
          </p>
        </Link>

        <div className="flex items-baseline gap-1.5">
          {hasPromo ? (
            <>
              <span className="text-sm md:text-base font-extrabold" style={{ color: '#C8860A' }}>
                {formatPrice(promo_price!)}
              </span>
              <span
                className="text-[10px] md:text-[11px]"
                style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#7A4A3A', textDecoration: 'line-through' }}
              >
                {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-sm md:text-base font-extrabold" style={{ color: '#C8860A' }}>
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Stock indicator compact — only for stock ≤ 10 */}
        {localStock > 0 && localStock <= 10 && (
          <StockIndicator stock={localStock} compact />
        )}

        <div className="mt-auto">
          {isOutOfStock ? (
            <div
              className="flex w-full items-center justify-center rounded-full py-2 text-xs font-bold"
              style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(44,26,26,0.08)', color: dark ? 'rgba(255,255,255,0.5)' : '#7A4A3A' }}
            >
              Rupture de stock
            </div>
          ) : (
            <Button
              variant="whatsapp"
              size="sm"
              fullWidth
              iconLeft={<FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: 12 }} />}
              onClick={() => setShowModal(true)}
            >
              Commander
            </Button>
          )}
        </div>
      </div>

      {showModal && (
        <QuickOrderModal
          product={product}
          quantity={1}
          onClose={handleModalClose}
        />
      )}
    </motion.div>
  );
}
