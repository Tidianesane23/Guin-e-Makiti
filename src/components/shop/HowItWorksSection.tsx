'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faShoppingCart, faWhatsapp, faTruck,
} from '@/src/lib/icons';
import SectionTitle from '@/src/components/ui/SectionTitle';

const STEPS = [
  {
    number: 1,
    icon: faSearch,
    title: 'Choisissez',
    desc: "Parcourez nos produits et trouvez ce qu'il vous faut",
  },
  {
    number: 2,
    icon: faShoppingCart,
    title: 'Ajoutez',
    desc: 'Ajoutez vos articles au panier en un clic',
  },
  {
    number: 3,
    icon: faWhatsapp,
    title: 'Commandez',
    desc: 'Envoyez votre commande via WhatsApp en 1 message',
  },
  {
    number: 4,
    icon: faTruck,
    title: 'Recevez',
    desc: 'Recevez votre livraison à domicile sous 24h',
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function HowItWorksSection() {
  return (
    <section className="py-8 md:py-14 w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Simple & Rapide" title="Comment commander ?" />

        <div
          className="rounded-3xl px-4 py-6 md:px-10 md:py-10"
          style={{ background: 'rgba(200,134,10,0.04)', border: '1px solid rgba(200,134,10,0.1)' }}
        >
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-8"
          >
            {/* Connector line — desktop only */}
            <div
              className="absolute top-5 left-0 right-0 hidden md:block pointer-events-none"
              style={{ height: 2, background: 'linear-gradient(90deg, rgba(200,134,10,0.15), rgba(200,134,10,0.4), rgba(200,134,10,0.15))', margin: '0 12.5%' }}
            />

            {STEPS.map((step) => (
              <motion.div
                key={step.number}
                variants={item}
                className="relative flex flex-col items-center gap-3 text-center"
              >
                {/* Circle */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#C8860A', boxShadow: '0 4px 16px rgba(200,134,10,0.35)' }}>
                  <FontAwesomeIcon icon={step.icon} style={{ fontSize: 16, width: 16, height: 16, color: '#fff' }} />
                  <span
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                    style={{ background: '#1C0A0A', border: '2px solid #C8860A' }}
                  >
                    {step.number}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-sm md:text-base" style={{ color: '#2C1A1A' }}>{step.title}</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#7A4A3A', maxWidth: 160 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
