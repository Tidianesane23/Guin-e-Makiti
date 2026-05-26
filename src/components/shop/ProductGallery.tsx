'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faCheck } from '@/src/lib/icons';
import { cn } from '@/src/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
  forcedIndex?: number;
  onIndexChange?: (i: number) => void;
}

const AUTOPLAY_MS = 3500;

const variants = {
  enter:  (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir < 0 ? '60%' : '-60%', opacity: 0 }),
};

export default function ProductGallery({ images, name, forcedIndex, onIndexChange }: ProductGalleryProps) {
  const [[index, direction], setSlide] = useState([0, 0]);
  const [copied, setCopied] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => { indexRef.current = index; }, [index]);

  // Sync with external variant selection
  useEffect(() => {
    if (forcedIndex !== undefined && forcedIndex !== indexRef.current) {
      setSlide([forcedIndex, forcedIndex > indexRef.current ? 1 : -1]);
    }
  }, [forcedIndex]);

  const goTo = useCallback((next: number, dir?: number) => {
    setSlide(([prev]) => [next, dir ?? (next > prev ? 1 : -1)]);
    onIndexChange?.(next);
  }, [onIndexChange]);

  // Auto-play — always runs, no pause on hover
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      const next = (indexRef.current + 1) % images.length;
      setSlide([next, 1]);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [images.length]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl shadow-sm"
        style={{ background: '#F9F5F2' }}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: 'easeOut' as const }}
            className="absolute inset-0"
          >
            <Image
              src={images[index]}
              alt={`${name} — vue ${index + 1}`}
              fill
              className="object-contain p-3"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Share button */}
        <button
          onClick={handleShare}
          aria-label="Partager ce produit"
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-noir shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        >
          {copied ? (
            <>
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 13 }} className="text-vert" />
              <span className="text-vert">Lien copié !</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faShare} style={{ fontSize: 13 }} />
              Partager
            </>
          )}
        </button>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Vue ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === index ? 20 : 7,
                  height:     7,
                  background: i === index ? '#C8860A' : 'rgba(44,26,26,0.25)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Vue ${i + 1}`}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200',
                i === index
                  ? 'border-rouge scale-105 shadow-sm'
                  : 'border-transparent bg-gray-50 hover:border-gray-300',
              )}
              style={{ background: '#F9F5F2' }}
            >
              <Image
                src={src}
                alt={`${name} — miniature ${i + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
