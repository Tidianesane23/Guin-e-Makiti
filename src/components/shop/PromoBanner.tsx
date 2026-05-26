import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@/src/lib/icons';

interface PromoBannerProps {
  badge:           string;
  title:           string;
  titleHighlight?: string;
  subtitle?:       string;
  advantages:      string[];
  image:           string;
  buttonText:      string;
  buttonLink:      string;
}

export default function PromoBanner({
  badge,
  title,
  titleHighlight,
  subtitle,
  advantages,
  image,
  buttonText,
  buttonLink,
}: PromoBannerProps) {
  return (
    <section className="py-4 md:py-10 w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-5 py-5 md:px-10 md:py-10"
          style={{ background: '#1C0A0A' }}
        >
          {/* Cercles décoratifs */}
          <div
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: 'rgba(200,134,10,0.15)', filter: 'blur(40px)' }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'rgba(192,57,43,0.12)', filter: 'blur(32px)' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">

            {/* Contenu gauche */}
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">

              <div>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
                  style={{
                    background: 'rgba(200,134,10,0.2)',
                    border:     '1px solid rgba(200,134,10,0.4)',
                    color:      '#C8860A',
                  }}
                >
                  {badge}
                </span>
              </div>

              <div>
                <p className="text-xl font-bold leading-snug text-white md:text-2xl">{title}</p>
                {titleHighlight && (
                  <p className="text-xl font-bold leading-snug md:text-2xl" style={{ color: '#C8860A' }}>
                    {titleHighlight}
                  </p>
                )}
              </div>

              {subtitle && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{subtitle}</p>
              )}

              <ul className="flex flex-col gap-2 w-full">
                {advantages.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-left">
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(37,211,102,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, width: 10, height: 10, color: '#25D366' }} />
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.4 }}>{a}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center md:justify-start">
                <Link
                  href={buttonLink}
                  className="btn-shimmer inline-flex items-center justify-center rounded-full font-bold uppercase tracking-[0.8px] text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(200,134,10,0.4)] px-6 py-3 text-sm"
                  style={{ background: '#C8860A' }}
                >
                  {buttonText}
                </Link>
              </div>
            </div>

            {/* Visuel droite — desktop uniquement */}
            <div className="hidden md:flex items-center justify-center w-56 shrink-0">
              <div className="animate-float">
                <img
                  src={image}
                  alt={title}
                  width={220}
                  height={200}
                  loading="lazy"
                  style={{ width: 220, height: 200, maxHeight: 200, objectFit: 'contain' }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
