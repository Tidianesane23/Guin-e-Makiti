'use client';

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faWhatsapp } from '@/src/lib/icons';
import HeroCarousel from './HeroCarousel';
import Button from '@/src/components/ui/Button';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

const STATS = [
  { value: '500+',   label: 'Produits'           },
  { value: '2 000+', label: 'Clients satisfaits' },
  { value: '24h',    label: 'Délai de livraison' },
];

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="py-4 md:py-8 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">

        {/* Carousel */}
        <HeroCarousel />

        {/* Contenu texte */}
        <div className="flex flex-col gap-4 md:gap-5">

          {/* Badge */}
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
              style={{
                background: 'rgba(200,134,10,0.15)',
                border:     '1px solid rgba(200,134,10,0.4)',
                color:      '#C8860A',
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse-dot"
                style={{ background: '#C8860A' }}
              />
              N°1 Shopping en Guinée
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">
            <span className="block" style={{ color: '#2C1A1A' }}>Vos achats en ligne,</span>
            <span className="block shimmer-text">livrés chez vous !</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xs md:text-sm" style={{ color: '#7A4A3A' }}>
            Produits de qualité • Livraison rapide à Conakry • Paiement à la livraison
          </p>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="sm:!w-auto btn-glow-or"
              iconLeft={<FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 16 }} />}
              onClick={() => router.push('/boutique')}
            >
              Voir la boutique
            </Button>
            <Button
              variant="whatsapp"
              size="lg"
              fullWidth
              className="sm:!w-auto"
              iconLeft={<FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: 16 }} />}
              onClick={() => window.open(`https://wa.me/${WA_NUMBER}`, '_blank', 'noopener,noreferrer')}
            >
              Commander WhatsApp
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center py-3 px-2 rounded-xl"
                style={{
                  background:     'rgba(255,255,255,0.65)',
                  border:         '1px solid rgba(200,134,10,0.18)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="text-base font-extrabold md:text-lg" style={{ color: '#C8860A' }}>
                  {value}
                </span>
                <span className="text-[10px] font-medium mt-0.5 text-center" style={{ color: '#7A4A3A' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
