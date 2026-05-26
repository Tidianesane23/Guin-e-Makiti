'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faLightbulb, faRocket, faChevronRight } from '@/src/lib/icons';
import SectionTitle from '@/src/components/ui/SectionTitle';

const CARDS = [
  {
    icon:      faExclamationCircle,
    iconColor: '#C0392B',
    title:     'La Problématique',
    text:      'Le commerce en ligne en Guinée est complexe, peu fiable et peu adapté aux réalités locales.',
    bg:        'rgba(192,57,43,0.06)',
    border:    'rgba(192,57,43,0.15)',
  },
  {
    icon:      faLightbulb,
    iconColor: '#C8860A',
    title:     'Notre Solution',
    text:      'Une plateforme simple, une commande via WhatsApp, une livraison rapide. Pas besoin de carte bancaire.',
    bg:        'rgba(200,134,10,0.06)',
    border:    'rgba(200,134,10,0.15)',
  },
  {
    icon:      faRocket,
    iconColor: '#009944',
    title:     'Notre Objectif',
    text:      "Devenir la référence du e-commerce en Afrique de l'Ouest en partant de la Guinée.",
    bg:        'rgba(0,153,68,0.06)',
    border:    'rgba(0,153,68,0.15)',
  },
];

const STATS = [
  { value: '500+',   label: 'Produits disponibles'    },
  { value: '2 000+', label: 'Clients satisfaits'      },
  { value: '24h',    label: 'Délai de livraison'      },
  { value: '100%',   label: 'Paiement à la livraison' },
];

const CHALLENGES = [
  'Assurer une livraison fiable dans toute la ville de Conakry',
  "Maintenir la qualité et l'authenticité de chaque produit",
  'Offrir un service client réactif 6 jours sur 7',
];

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function AboutSection() {
  return (
    <section className="py-8 md:py-14 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">

        <SectionTitle eyebrow="Notre histoire" title="Qui sommes-nous ?" />

        {/* Intro */}
        <p
          className="text-center mx-auto max-w-2xl"
          style={{ fontSize: 14, color: '#7A4A3A', lineHeight: 1.8 }}
        >
          Guinée Makiti est la première plateforme e-commerce pensée pour les Guinéens.
          Née à Conakry, notre mission est simple : vous permettre d&apos;acheter en ligne
          facilement et recevoir vos commandes rapidement.
        </p>

        {/* 3 Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={item}
              className="flex flex-col gap-3 p-5"
              style={{
                background:   card.bg,
                border:       `1px solid ${card.border}`,
                borderRadius: 16,
              }}
            >
              <FontAwesomeIcon
                icon={card.icon}
                style={{ fontSize: 24, width: 24, height: 24, color: card.iconColor }}
              />
              <p className="font-bold text-sm" style={{ color: '#2C1A1A' }}>{card.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#7A4A3A' }}>{card.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[20px]"
          style={{ background: '#1C0A0A' }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-3xl font-black" style={{ color: '#C8860A' }}>{value}</span>
              <span
                className="text-[10px] uppercase tracking-widest leading-tight"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Défis */}
        <div className="flex flex-col gap-3">
          <p className="font-bold text-base" style={{ color: '#2C1A1A' }}>Nos défis quotidiens</p>
          <ul className="flex flex-col gap-2">
            {CHALLENGES.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <FontAwesomeIcon
                  icon={faChevronRight}
                  style={{ fontSize: 12, width: 12, height: 12, color: '#C8860A', marginTop: 3, flexShrink: 0 }}
                />
                <span style={{ fontSize: 14, color: '#7A4A3A', lineHeight: 1.6 }}>{c}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
