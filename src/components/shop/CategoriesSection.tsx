'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Category } from '@/src/types';

const EMOJI_MAP: Record<string, string> = {
  smartphones:    '📱',
  accessoires:    '🎧',
  audio:          '🔊',
  electromenager: '🏠',
  mode:           '👗',
  beaute:         '✨',
};

const CIRCLE_COLORS = ['bg-rouge', 'bg-vert', 'bg-jaune', 'bg-rouge', 'bg-vert', 'bg-jaune'];
const SHADOW_COLORS = [
  'hover:shadow-rouge/30',
  'hover:shadow-vert/30',
  'hover:shadow-jaune/30',
  'hover:shadow-rouge/30',
  'hover:shadow-vert/30',
  'hover:shadow-jaune/30',
];

interface CategoriesSectionProps {
  categories: Category[];
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories.length) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Titre avec trait rouge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-14"
        >
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-noir md:text-3xl">
            NOS CATÉGORIES
          </h2>
          <div className="mt-2 h-1 w-16 rounded-full bg-rouge" />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:gap-6"
        >
          {categories.map((cat, i) => (
            <motion.div key={cat.id} variants={item} className="snap-start shrink-0 w-40 md:w-auto">
              <Link href={`/boutique?categorie=${cat.slug}`} className="block">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  transition={{ duration: 0.18, ease: 'easeOut' as const }}
                  className={`flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm cursor-pointer ${SHADOW_COLORS[i % SHADOW_COLORS.length]}`}
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-md ${CIRCLE_COLORS[i % CIRCLE_COLORS.length]}`}>
                    {EMOJI_MAP[cat.slug] ?? '🛍️'}
                  </div>
                  <p className="font-bold text-noir text-sm">{cat.name}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
