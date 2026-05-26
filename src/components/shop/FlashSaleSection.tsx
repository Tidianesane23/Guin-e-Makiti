'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire } from '@/src/lib/icons';
import type { Product } from '@/src/types';
import ProductCard from '@/src/components/ui/ProductCard';
import SectionTitle from '@/src/components/ui/SectionTitle';
import { getFeaturedProducts } from '@/src/lib/services/products.service';

interface FlashSaleSectionProps {
  products: Product[];
}

function getTargetTime() {
  const t = new Date();
  t.setHours(23, 59, 59, 999);
  return t.getTime();
}

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    setRemaining(Math.max(0, target - Date.now()));
    const id = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const h = String(Math.floor(remaining / 3_600_000)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, '0');
  const s = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0');
  return { h, m, s };
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function FlashSaleSection({ products: initialProducts }: FlashSaleSectionProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { h, m, s } = useCountdown(getTargetTime());

  useEffect(() => {
    getFeaturedProducts(8).then(setProducts).catch(() => {});
  }, []);

  const promoProducts = products.filter((p) => p.promo_price && p.promo_price < p.price);

  if (promoProducts.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-6 pt-8 pb-10 md:px-10"
          style={{ background: '#1C0A0A' }}
        >
          {/* Déco */}
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full pointer-events-none" style={{ background: 'rgba(200,134,10,0.12)', filter: 'blur(40px)' }} />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full pointer-events-none" style={{ background: 'rgba(192,57,43,0.1)', filter: 'blur(32px)' }} />

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <SectionTitle
                eyebrow={<><FontAwesomeIcon icon={faFire} style={{ fontSize: 12, color: '#C8860A' }} /> Limité</>}
                title="Ventes Flash"
                light
              />

              {/* Countdown */}
              <div className="flex flex-col items-center sm:items-end gap-1">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  L&apos;offre expire dans
                </p>
                <div className="flex items-center gap-1.5">
                  {[h, m, s].map((unit, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-extrabold text-white tabular-nums"
                        style={{ background: 'rgba(200,134,10,0.15)', border: '1px solid rgba(200,134,10,0.3)' }}
                      >
                        {unit}
                      </span>
                      {i < 2 && <span className="text-lg font-bold" style={{ color: '#C8860A' }}>:</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Products grid */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4"
            >
              {promoProducts.slice(0, 4).map((product) => (
                <motion.div key={product.id} variants={item} className="flex flex-col gap-2">

                  {/* Flash badge */}
                  <div className="relative">
                    <ProductCard product={product} dark />
                    <span
                      className="absolute top-2 right-2 rounded px-2 py-0.5 text-[10px] font-extrabold uppercase text-white animate-pulse-dot"
                      style={{ background: '#C0392B', letterSpacing: '0.05em' }}
                    >
                      FLASH
                    </span>
                  </div>

                  {/* Stock progress */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Stock</span>
                      <span className="text-[10px] font-semibold" style={{ color: '#C8860A' }}>
                        Plus que {product.stock} en stock !
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:      `${Math.min(100, Math.max(8, (product.stock / 20) * 100))}%`,
                          background: '#C8860A',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
