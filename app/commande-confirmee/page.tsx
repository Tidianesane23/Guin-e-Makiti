'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/src/lib/formatters';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

const STEPS = [
  { icon: '💬', label: 'WhatsApp ouvert', sub: 'Vérifiez l\'application' },
  { icon: '✅', label: 'Confirmation rapide', sub: 'Notre équipe vous contacte sous peu' },
  { icon: '🚚', label: 'Livraison à Conakry', sub: 'Paiement à la réception' },
];

function ConfirmationContent() {
  const params   = useSearchParams();
  const orderId  = params.get('id')  ?? '';
  const nom      = params.get('nom') ?? '';
  const total    = Number(params.get('total') ?? 0);
  const shortId  = orderId ? orderId.slice(0, 8).toUpperCase() : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Checkmark animé */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mb-6 flex justify-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={52} className="text-green-500" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-noir md:text-3xl">
            Commande envoyée !
          </h1>
          {nom && (
            <p className="mt-2 text-gray-500">
              Merci <span className="font-semibold text-noir">{nom}</span>, votre commande a bien été reçue.
            </p>
          )}
        </motion.div>

        {/* Récap commande */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-6 rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Référence commande
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold text-noir">
                {shortId ? `#${shortId}` : '—'}
              </p>
            </div>
            {total > 0 && (
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total</p>
                <p className="mt-0.5 text-lg font-bold text-rouge">{formatPrice(total)}</p>
              </div>
            )}
          </div>
          <p className="mt-3 rounded-lg bg-[#25D366]/10 px-3 py-2 text-xs font-medium text-[#128C7E]">
            📱 WhatsApp a été ouvert automatiquement avec votre commande
          </p>
        </motion.div>

        {/* Étapes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-4 rounded-2xl bg-white p-5 shadow-sm"
        >
          <p className="mb-4 text-sm font-semibold text-noir">Prochaines étapes</p>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base">
                  {step.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-noir">{step.label}</p>
                  <p className="text-xs text-gray-400">{step.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/boutique"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-noir hover:text-noir"
          >
            <ShoppingBag size={16} />
            Continuer mes achats
          </Link>
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle size={16} />
            Ouvrir WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />
      <div className="mt-6 h-8 w-56 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-4 h-32 w-full max-w-lg animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}

export default function CommandeConfirmeePage() {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <ConfirmationContent />
    </Suspense>
  );
}
