'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Fatoumata Diallo',
    city: 'Conakry',
    rating: 5,
    text: 'Livraison rapide et produit conforme à la description ! Je recommande vivement Guinée Makiti pour tous vos achats tech.',
    initials: 'FD',
    avatarBg: 'bg-rouge',
    avatarText: 'text-white',
  },
  {
    id: '2',
    name: 'Mamadou Bah',
    city: 'Conakry',
    rating: 5,
    text: 'Service client excellent via WhatsApp. Réponse immédiate et commande livrée en moins de 2h. Vraiment satisfait !',
    initials: 'MB',
    avatarBg: 'bg-vert',
    avatarText: 'text-white',
  },
  {
    id: '3',
    name: 'Aissatou Camara',
    city: 'Ratoma, Conakry',
    rating: 4,
    text: 'Très bonne qualité des produits, prix compétitifs par rapport au marché. La plateforme WhatsApp est très pratique.',
    initials: 'AC',
    avatarBg: 'bg-jaune',
    avatarText: 'text-noir',
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-2xl font-bold text-noir md:text-3xl"
        >
          Ce que disent nos clients
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.id}
              variants={item}
              className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill="currentColor"
                    className={i < t.rating ? 'text-jaune' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="flex-1 text-sm leading-relaxed text-gray-600">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.avatarBg} ${t.avatarText}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-noir">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
