'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/src/components/ui/Button';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#111111] via-[#1a0000] to-[#B71C1C] py-24 md:py-36">
      {/* Decorative blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-rouge/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-rouge/50 bg-rouge/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              🇬🇳 N°1 de la vente en ligne en Guinée
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={item}
            className="text-4xl font-bold leading-tight md:text-6xl"
          >
            <span className="block text-white">Achetez Malin,</span>
            <span className="block text-rouge">Livrez Vite.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="max-w-md text-lg leading-relaxed text-gray-300"
          >
            Découvrez des produits de qualité livrés rapidement à Conakry.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/boutique">
              <Button variant="primary" size="lg">
                Voir la boutique
              </Button>
            </Link>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="whatsapp" size="lg" iconLeft={<WhatsAppSVG />}>
                Commander via WhatsApp
              </Button>
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={item}
            className="flex items-center gap-6 text-gray-400 text-sm"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-vert" />
              Livraison à Conakry
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-jaune" />
              Paiement à la livraison
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rouge" />
              Support 7j/7
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function WhatsAppSVG() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
