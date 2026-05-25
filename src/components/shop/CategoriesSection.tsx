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

const BG_MAP: Record<string, string> = {
  smartphones:    'bg-blue-50',
  accessoires:    'bg-purple-50',
  audio:          'bg-green-50',
  electromenager: 'bg-orange-50',
  mode:           'bg-pink-50',
  beaute:         'bg-yellow-50',
};

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
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-2xl font-bold text-noir md:mb-12 md:text-3xl"
        >
          Nos Catégories
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:gap-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={item} className="snap-start shrink-0 w-40 md:w-auto">
              <Link href={`/boutique?categorie=${cat.slug}`} className="block">
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(229,57,53,0.15)' }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm cursor-pointer"
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${BG_MAP[cat.slug] ?? 'bg-gray-50'}`}>
                    {EMOJI_MAP[cat.slug] ?? '🛍️'}
                  </div>
                  <div>
                    <p className="font-bold text-noir text-sm">{cat.name}</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
