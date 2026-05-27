'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faChevronLeft, faChevronRight, faMobileAlt, faHeadphones, faTshirt, faHome, faStar,
} from '@/src/lib/icons';

interface Slide {
  bg:     string;
  image?: string;
  icon:   IconDefinition;
  label:  string;
  title:  string;
  cta:    string;
  href:   string;
}

const SLIDES: Slide[] = [
  {
    bg:    'linear-gradient(135deg, #1C0A0A, #3A1A00, #6B3A00)',
    image: '/Tabaski.jpeg',
    icon:  faStar,
    label: '🌙 Tabaski Mubarak',
    title: 'Bonne fête\nde Tabaski !',
    cta:   'Voir la boutique →',
    href:  '/boutique',
  },
  {
    bg:    'linear-gradient(135deg, #2C0A0A, #5C1A1A, #8B2E2E)',
    image: '/Banierre.jpeg',
    icon:  faMobileAlt,
    label: 'Nouveauté',
    title: 'Smartphones\nlast génération',
    cta:   'Découvrir →',
    href:  '/boutique?categorie=smartphones',
  },
  {
    bg:    'linear-gradient(135deg, #0A1A2C, #1A3A5C, #2E5C8B)',
    image: '/autreImage1.jpeg',
    icon:  faHeadphones,
    label: 'Promo -30%',
    title: 'Audio premium\nprix imbattables',
    cta:   'Profiter →',
    href:  '/boutique?categorie=audio',
  },
  {
    bg:    'linear-gradient(135deg, #1A2C0A, #3A5C1A, #5C8B2E)',
    image: '/autreImage2.jpeg',
    icon:  faTshirt,
    label: 'Collection 2025',
    title: 'Mode & Beauté\ntendances',
    cta:   'Explorer →',
    href:  '/boutique?categorie=mode',
  },
  {
    bg:    'linear-gradient(135deg, #2C1A0A, #5C3A1A, #8B5C2E)',
    image: '/autreImage3.jpeg',
    icon:  faHome,
    label: 'Maison & Déco',
    title: 'Équipez votre\nmaison facilement',
    cta:   'Voir tout →',
    href:  '/boutique?categorie=electromenager',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const animating = useRef(false);

  const goTo = (idx: number) => {
    if (animating.current) return;
    animating.current = true;
    setCurrent(idx);
    setTimeout(() => { animating.current = false; }, 520);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  useEffect(() => {
    const id = setTimeout(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, 3500);
    return () => clearTimeout(id);
  }, [current]);

  return (
    <div className="relative w-full h-[200px] md:h-[280px] lg:h-[380px] overflow-hidden rounded-2xl shadow-lg">

      {/* Slides */}
      <div
        className="flex h-full"
        style={{
          transform:  `translateX(-${current * 100}%)`,
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="relative flex-none w-full h-full flex items-center px-8 md:px-14"
            style={{ background: slide.bg }}
          >
            {slide.image && (
              <img
                src={slide.image}
                alt={slide.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)' }}
            />

            {/* Icône décorative droite */}
            <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 animate-float opacity-20 md:opacity-30">
              <FontAwesomeIcon icon={slide.icon} style={{ fontSize: 72 }} className="text-white md:!text-[110px]" />
            </div>

            {/* Contenu */}
            <div className="relative z-10 flex flex-col gap-2.5 md:gap-3 max-w-xs">
              <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[10px] md:text-xs font-semibold text-white uppercase tracking-wider">
                {slide.label}
              </span>
              <p className="text-white font-extrabold text-sm sm:text-base md:text-xl lg:text-3xl leading-tight whitespace-pre-line drop-shadow-lg">
                {slide.title}
              </p>
              <Link
                href={slide.href}
                className="w-fit rounded-full border border-white/40 bg-white/20 backdrop-blur-sm px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/35 transition-colors"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ← bouton */}
      <button
        onClick={prev}
        aria-label="Slide précédent"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} />
      </button>

      {/* → bouton */}
      <button
        onClick={next}
        aria-label="Slide suivant"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 16 }} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
