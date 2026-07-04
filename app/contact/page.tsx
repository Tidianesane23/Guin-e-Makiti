'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPhone, faMapMarkerAlt, faClock, faArrowRight } from '@/src/lib/icons';
import Button from '@/src/components/ui/Button';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

const INFO_CARDS: { icon: IconDefinition; title: string; lines: string[]; color: string; bg: string }[] = [
  {
    icon: faPhone,
    title: 'Téléphone',
    lines: ['626874755 - 620326981', 'Tous les jours, 8h – 20h'],
    color: 'text-rouge',
    bg: 'bg-rouge/10',
  },
  {
    icon: faMapMarkerAlt,
    title: 'Adresse',
    lines: ['Conakry', 'République de Guinée'],
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: faClock,
    title: 'Horaires',
    lines: ['Lun – Sam : 8h – 20h', 'Dimanche : 10h – 18h'],
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

const FAQ = [
  {
    q: 'Comment passer une commande ?',
    a: 'Ajoutez vos produits au panier puis cliquez sur "Commander via WhatsApp". Notre équipe confirme votre commande en moins de 30 minutes.',
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Livraison le jour même ou le lendemain à Conakry. Délais variables pour les autres régions de Guinée.',
  },
  {
    q: 'Comment fonctionne le paiement ?',
    a: 'Nous acceptons le paiement à la livraison en espèces. Aucun paiement en ligne requis.',
  },
  {
    q: 'Les produits sont-ils garantis ?',
    a: 'Tous nos produits sont authentiques et vérifiés. Nous offrons un échange sous 48h en cas de défaut.',
  },
];

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function ContactPage() {
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = [
      `Bonjour Guinée Makiti !`,
      `Je m'appelle ${name.trim()}.`,
      phone.trim() ? `Mon numéro : ${phone.trim()}` : '',
      '',
      message.trim(),
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <h1 className="text-3xl font-bold text-noir md:text-4xl">Contactez-nous</h1>
            <p className="mt-2 max-w-lg text-gray-500">
              Une question, une commande, un problème de livraison ? Notre équipe est disponible sur WhatsApp du lundi au samedi.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* ── Left ── */}
          <div className="flex flex-col gap-5">

            {/* WhatsApp primary CTA */}
            <motion.a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' as const }}
              className="group flex items-center gap-5 rounded-2xl bg-[#25D366] p-6 text-white shadow-sm transition-opacity hover:opacity-95"
            >
              <div className="rounded-xl bg-white/20 p-3 shrink-0">
                <WhatsAppIcon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold">Commander via WhatsApp</p>
                <p className="mt-0.5 text-sm text-white/80">Réponse garantie en moins de 30 minutes</p>
              </div>
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 20 }} className="shrink-0 opacity-70 transition-transform group-hover:translate-x-1" />
            </motion.a>

            {/* Info cards */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-3"
            >
              {INFO_CARDS.map(({ icon, title, lines, color, bg }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className={`mb-3 inline-flex rounded-xl p-2.5 ${bg}`}>
                    <FontAwesomeIcon icon={icon} style={{ fontSize: 20 }} className={color} />
                  </div>
                  <p className="font-bold text-noir">{title}</p>
                  {lines.map((l) => (
                    <p key={l} className="mt-0.5 text-sm leading-snug text-gray-500">{l}</p>
                  ))}
                </motion.div>
              ))}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' as const }}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="mb-5 font-bold text-noir">Questions fréquentes</h2>
              <div className="flex flex-col divide-y divide-gray-100">
                {FAQ.map(({ q, a }) => (
                  <div key={q} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-noir">{q}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: form ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' as const }}
            className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-24"
          >
            <h2 className="text-lg font-bold text-noir">Envoyer un message</h2>
            <p className="mt-1 mb-5 text-sm text-gray-500">
              Votre message s&apos;ouvrira directement dans WhatsApp, pré-rempli.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-sm font-medium text-noir">
                  Votre nom <span className="text-rouge">*</span>
                </label>
                <input
                  id="contact-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mamadou Diallo"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-phone" className="text-sm font-medium text-noir">
                  Téléphone
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+224 6XX XX XX XX"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-sm font-medium text-noir">
                  Message <span className="text-rouge">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bonjour, je voudrais des informations sur..."
                  rows={5}
                  className={inputCls + ' resize-none'}
                />
              </div>

              <Button
                type="submit"
                variant="whatsapp"
                fullWidth
                iconLeft={<WhatsAppIcon className="h-4 w-4" />}
                className="mt-1"
              >
                Envoyer via WhatsApp
              </Button>

              <p className="text-center text-xs text-gray-400">
                Aucune donnée stockée — message envoyé directement via WhatsApp.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-rouge focus:ring-1 focus:ring-rouge';
