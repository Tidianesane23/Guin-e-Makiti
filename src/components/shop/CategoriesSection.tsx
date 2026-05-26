'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faMobileAlt, faHeadphones, faTshirt, faPlug, faHome, faGem,
} from '@/src/lib/icons';
import type { Category } from '@/src/types';
import SectionTitle from '@/src/components/ui/SectionTitle';

interface IconStyle { bg: string; color: string; icon: IconDefinition }

const ICON_MAP: Record<string, IconStyle> = {
  smartphones:    { bg: 'rgba(192,57,43,0.1)',  color: '#C0392B', icon: faMobileAlt  },
  audio:          { bg: 'rgba(200,134,10,0.1)', color: '#C8860A', icon: faHeadphones },
  mode:           { bg: 'rgba(44,26,26,0.07)',  color: '#7A4A3A', icon: faTshirt     },
  accessoires:    { bg: 'rgba(192,57,43,0.1)',  color: '#C0392B', icon: faPlug       },
  electromenager: { bg: 'rgba(200,134,10,0.1)', color: '#C8860A', icon: faHome       },
  beaute:         { bg: 'rgba(44,26,26,0.07)',  color: '#7A4A3A', icon: faGem        },
};
const DEFAULT_STYLE: IconStyle = { bg: 'rgba(200,134,10,0.1)', color: '#C8860A', icon: faGem };

interface CategoriesSectionProps { categories: Category[] }

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories.length) return null;

  return (
    <section className="py-8 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Explorer" title="Nos catégories" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4"
        >
          {categories.map((cat) => {
            const style = ICON_MAP[cat.slug] ?? DEFAULT_STYLE;
            return (
              <motion.div key={cat.id} variants={item}>
                <Link href={`/boutique?categorie=${cat.slug}`} className="block">
                  <motion.div
                    whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(200,134,10,0.15)' }}
                    transition={{ duration: 0.18, ease: 'easeOut' as const }}
                    className="flex flex-col items-center gap-2.5 rounded-2xl p-3 md:p-4 text-center cursor-pointer"
                    style={{
                      background:     'rgba(255,255,255,0.65)',
                      border:         '1px solid rgba(44,26,26,0.1)',
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    <div
                      className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl"
                      style={{ background: style.bg }}
                    >
                      <FontAwesomeIcon
                        icon={style.icon}
                        style={{ fontSize: 18, color: style.color }}
                        className="md:!text-[20px]"
                      />
                    </div>
                    <p
                      className="font-bold leading-snug text-[10px] md:text-xs"
                      style={{ color: '#2C1A1A' }}
                    >
                      {cat.name}
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
