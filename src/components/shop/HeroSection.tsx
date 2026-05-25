'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const AVANTAGES = [
  { emoji: '🏆', label: 'Qualité',          bg: 'bg-rouge' },
  { emoji: '🚚', label: 'Livraison Rapide',  bg: 'bg-vert'  },
  { emoji: '🛡️', label: 'Confiance',         bg: 'bg-jaune' },
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF5CC 0%, #FFE4F5 100%)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* ── Colonne gauche ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col gap-5 text-center md:text-left"
          >
            {/* Badge */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-rouge bg-white px-4 py-1.5 text-sm font-bold text-rouge shadow-sm">
                🇬🇳 N°1 Shopping en Guinée
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={item}
              className="text-4xl font-extrabold leading-tight md:text-6xl"
            >
              <span className="block text-noir">VOS ACHATS EN LIGNE,</span>
              <span className="block text-rouge">LIVRÉS CHEZ VOUS !</span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p variants={item} className="text-gray-600 text-base md:text-lg font-medium">
              Produits de qualité • Livraison rapide • Service fiable
            </motion.p>

            {/* 3 icônes avantages */}
            <motion.div
              variants={item}
              className="flex items-center justify-center md:justify-start gap-6 flex-wrap"
            >
              {AVANTAGES.map(({ emoji, label, bg }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center text-2xl shadow-md`}>
                    {emoji}
                  </div>
                  <span className="text-[11px] font-bold text-noir uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/boutique"
                className="flex items-center justify-center gap-2 rounded-full bg-rouge px-8 py-3.5 text-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
              >
                🛒 Voir la boutique
              </Link>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-vert px-8 py-3.5 text-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
              >
                💬 Commander WhatsApp
              </a>
            </motion.div>
          </motion.div>

          {/* ── Colonne droite : bannière ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' as const, delay: 0.2 }}
            className="hidden md:flex flex-1 items-center justify-center"
          >
            <Image
              src="/Banierre.jpeg"
              alt="Guinée Makiti — Boutique en ligne"
              width={560}
              height={400}
              className="object-contain max-h-[400px] w-auto"
              priority
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
