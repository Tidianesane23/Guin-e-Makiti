
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const STORAGE_KEY = 'tabaski_2026_dismissed';

export default function TabaskiBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        background:   '#1C0A0A',
        borderBottom: '1px solid rgba(200,134,10,0.3)',
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Cercles décoratifs cohérents avec PromoBanner */}
   <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(200,134,10,0.15)', filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -10, left: '30%',
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(37,211,102,0.08)', filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 relative z-10">

        <div className="flex items-center gap-3 min-w-0">
          {/* Image */}
      /*    <div className="shrink-0">
            <Image
              src="/Tabaski.jpeg"
              alt="Tabaski Mubarak"
              width={48}
              height={48}
              className="rounded-lg object-contain"
              style={{ width: 44, height: 44 }}
            />
          </div>

          {/* Texte */}
        <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-snug">
              🌙{' '}
              <span style={{ color: '#C8860A' }}>
                Bonne fête de Tabaski
              </span>{' '}
              à toute la communauté guinéenne !
            </p>
            <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Eid Mubarak — Guinée Makiti vous souhaite une belle célébration
            </p>
          </div>
        </div>

        {/* Bouton fermer */}
       <button
          onClick={dismiss}
          aria-label="Fermer la bannière Tabaski"
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}
        >
          ✕
        </button>
      </div>
    </div>

  );
}
