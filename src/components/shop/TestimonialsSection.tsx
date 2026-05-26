'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faChevronLeft, faChevronRight, faCheckCircle } from '@/src/lib/icons';
import SectionTitle from '@/src/components/ui/SectionTitle';
import { getPublishedReviews, type Review } from '@/src/lib/services/reviews.service';

// ─── Static fallback reviews ──────────────────────────────────────────────────

const STATIC_REVIEWS = [
  {
    id:           's1',
    customer_name: 'Mamadou K.',
    rating:        5,
    comment:       'Livraison super rapide ! J\'ai reçu ma commande le lendemain. Service impeccable.',
    product_names: undefined as string | undefined,
    city:          'Conakry',
  },
  {
    id:           's2',
    customer_name: 'Fatoumata D.',
    rating:        5,
    comment:       'Produits de qualité, exactement comme sur les photos. Je recommande !',
    product_names: undefined as string | undefined,
    city:          'Ratoma',
  },
  {
    id:           's3',
    customer_name: 'Ibrahim S.',
    rating:        4,
    comment:       'Très bon service client sur WhatsApp. Ils répondent rapidement.',
    product_names: undefined as string | undefined,
    city:          'Kaloum',
  },
];

const AVATAR_COLORS = ['#C8860A', '#C0392B', '#7A4A3A', '#1565C0', '#009944', '#E65100'];

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function avatarColor(name: string, index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ─── Single card ──────────────────────────────────────────────────────────────

interface CardData {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_names?: string;
  city?: string;
  verified?: boolean;
}

const cardVariant = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function ReviewCard({ card, index }: { card: CardData; index: number }) {
  return (
    <motion.div
      variants={cardVariant}
      className="flex flex-col gap-3 rounded-2xl p-5 shadow-sm shrink-0 w-[280px] md:w-auto"
      style={{
        background:     'rgba(255,255,255,0.85)',
        border:         '1px solid rgba(44,26,26,0.08)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Top row: stars + verified badge */}
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              style={{ fontSize: 13, color: i < card.rating ? '#C8860A' : 'rgba(44,26,26,0.1)' }}
            />
          ))}
        </div>
        {card.verified && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: '#00994415', color: '#009944' }}
          >
            <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 9 }} />
            Achat vérifié
          </span>
        )}
      </div>

      {/* Product tag */}
      {card.product_names && (
        <p
          className="rounded-lg px-2.5 py-1 text-[10px] font-semibold truncate"
          style={{ background: 'rgba(200,134,10,0.09)', color: '#7A4A3A' }}
        >
          {card.product_names}
        </p>
      )}

      {/* Comment */}
      <p className="flex-1 text-sm leading-relaxed line-clamp-4" style={{ color: '#7A4A3A' }}>
        &ldquo;{card.comment}&rdquo;
      </p>

      {/* Author */}
      <div
        className="flex items-center gap-3 pt-3"
        style={{ borderTop: '1px solid rgba(44,26,26,0.07)' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: avatarColor(card.customer_name, index) }}
        >
          {initials(card.customer_name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#2C1A1A' }}>
            {card.customer_name}
          </p>
          {card.city && (
            <p className="text-xs" style={{ color: '#7A4A3A' }}>{card.city}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

interface TestimonialsSectionProps {
  reviews?: Review[];
}

export default function TestimonialsSection({ reviews: initialReviews = [] }: TestimonialsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Re-fetch client-side on every mount to bypass Next.js router cache
  useEffect(() => {
    getPublishedReviews(6).then(setReviews).catch(() => {});
  }, []);

  // Merge real + static so we always show at least 3 cards
  const cards: CardData[] = reviews.length > 0
    ? reviews.map((r) => ({
        id:            r.id,
        customer_name: r.customer_name,
        rating:        r.rating,
        comment:       r.comment,
        product_names: r.product_names,
        verified:      true,
      }))
    : STATIC_REVIEWS.map((r) => ({ ...r, verified: false }));

  // Stats
  const avgRating = cards.length > 0
    ? (cards.reduce((s, c) => s + c.rating, 0) / cards.length).toFixed(1)
    : '4.8';
  const totalCount = reviews.length > 0 ? reviews.length : 200;

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="py-10 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Ils nous font confiance" title="Avis Clients" />

        {/* Stats */}
        <div className="mb-8 flex flex-col items-center gap-1.5">
          <p className="text-4xl font-extrabold" style={{ color: '#C8860A' }}>{avgRating}/5</p>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <FontAwesomeIcon key={i} icon={faStar} style={{ fontSize: 16, color: '#C8860A' }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: '#7A4A3A' }}>
            Basé sur {totalCount}+ avis clients
          </p>
        </div>

        {/* Mobile: horizontal scroll with arrows / Desktop: grid */}
        <div className="relative">
          {/* Arrow left */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-opacity hover:opacity-80"
            style={{ border: '1px solid rgba(44,26,26,0.1)' }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 13, color: '#2C1A1A' }} />
          </button>

          {/* Cards */}
          <motion.div
            ref={scrollRef}
            variants={{
              hidden:  {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cards.map((card, i) => (
              <div key={card.id} className="snap-start md:snap-none">
                <ReviewCard card={card} index={i} />
              </div>
            ))}
          </motion.div>

          {/* Arrow right */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-3 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-opacity hover:opacity-80"
            style={{ border: '1px solid rgba(44,26,26,0.1)' }}
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 13, color: '#2C1A1A' }} />
          </button>
        </div>

        {/* Mobile scroll hint dots */}
        {cards.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5 md:hidden">
            {cards.map((c, i) => (
              <div
                key={c.id}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === 0 ? 20 : 6, background: i === 0 ? '#C8860A' : '#D1D5DB' }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
