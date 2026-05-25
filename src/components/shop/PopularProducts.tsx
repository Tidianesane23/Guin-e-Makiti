'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/src/components/ui/ProductCard';
import type { Product } from '@/src/types';

interface PopularProductsProps {
  products: Product[];
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function PopularProducts({ products }: PopularProductsProps) {
  if (!products.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between md:mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-noir md:text-3xl"
          >
            Produits Populaires
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/boutique"
              className="flex items-center gap-1 text-sm font-medium text-rouge hover:opacity-70 transition-opacity"
            >
              Voir tout <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-rouge px-8 py-3 font-semibold text-rouge hover:bg-rouge hover:text-white transition-all duration-200"
          >
            Voir toute la boutique <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
