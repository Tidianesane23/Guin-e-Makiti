'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir < 0 ? '60%' : '-60%', opacity: 0 }),
};

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [[index, direction], setSlide] = useState([0, 0]);
  const [copied, setCopied] = useState(false);

  const goTo = useCallback((next: number) => {
    setSlide(([prev]) => [next, next > prev ? 1 : -1]);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silent fail
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeOut' as const }}
            className="absolute inset-0"
          >
            <Image
              src={images[index]}
              alt={`${name} — vue ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Share */}
        <button
          onClick={handleShare}
          aria-label="Partager ce produit"
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-noir shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        >
          {copied ? (
            <>
              <Check size={13} className="text-vert" />
              <span className="text-vert">Lien copié !</span>
            </>
          ) : (
            <>
              <Share2 size={13} />
              Partager
            </>
          )}
        </button>
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
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                i === index ? 'border-rouge' : 'border-transparent hover:border-gray-300',
              )}
            >
              <Image
                src={src}
                alt={`${name} — miniature ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
