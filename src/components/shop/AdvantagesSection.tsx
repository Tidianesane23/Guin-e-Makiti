'use client';

import { Truck, CheckCircle, MessageCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const ADVANTAGES: {
  icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  { icon: Truck,          title: 'Livraison Rapide',    desc: 'Conakry et ses environs' },
  { icon: CheckCircle,    title: 'Qualité Garantie',    desc: 'Produits vérifiés et authentiques' },
  { icon: MessageCircle,  title: 'Support WhatsApp',    desc: 'Réponse en moins de 30 minutes' },
  { icon: Shield,         title: 'Paiement Sécurisé',   desc: 'À la livraison uniquement' },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function AdvantagesSection() {
  return (
    <section className="bg-[#F5F5F5] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-2xl font-bold text-noir md:text-3xl"
        >
          Pourquoi choisir Guinée Makiti ?
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={item}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rouge/10">
                <Icon size={22} className="text-rouge" />
              </div>
              <div>
                <h3 className="font-bold text-noir text-sm md:text-base">{title}</h3>
                <p className="mt-0.5 text-xs text-gray-500 leading-snug">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
