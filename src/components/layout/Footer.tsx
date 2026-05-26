'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone, faClock, faMapMarkerAlt, faTruck, faCreditCard,
  faFacebook, faTiktok, faWhatsapp, faInstagram,
} from '@/src/lib/icons';
import LogoText from '@/src/components/ui/LogoText';

const NAV = [
  { label: 'Accueil',    href: '/'           },
  { label: 'Boutique',   href: '/boutique'   },
  { label: 'Catégories', href: '/categories' },
  { label: 'Contact',    href: '/contact'    },
];

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

const PILLS = [
  { icon: faTruck,      text: 'Livraison'      },
  { icon: faCreditCard, text: 'À la livraison' },
  { icon: faClock,      text: '8h–20h'         },
];

export default function Footer() {
  return (
    <footer style={{ background: '#1C0A0A', color: '#fff' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* ── Colonne 1 : Marque ── */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div>
              <LogoText size="lg" />
              <p
                className="mt-1 uppercase tracking-[1.5px]"
                style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}
              >
                Qualité · Livraison · Confiance 🇬🇳
              </p>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', maxWidth: 220, lineHeight: 1.6 }}>
              La meilleure expérience shopping en ligne en Guinée.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex gap-2.5">
              <SocialBtn href="https://facebook.com/guineemakiti" label="Facebook" hoverColor="#4267B2">
                <FontAwesomeIcon icon={faFacebook} style={{ fontSize: 15, color: 'inherit' }} />
              </SocialBtn>
              <SocialBtn href="https://tiktok.com/@guineemakiti" label="TikTok" hoverColor="#fff">
                <FontAwesomeIcon icon={faTiktok} style={{ fontSize: 15, color: 'inherit' }} />
              </SocialBtn>
              <SocialBtn href={`https://wa.me/${WA_NUMBER}`} label="WhatsApp" hoverColor="#25D366">
                <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: 15, color: 'inherit' }} />
              </SocialBtn>
              <SocialBtn href="https://instagram.com/guineemakiti" label="Instagram" hoverColor="#E1306C">
                <FontAwesomeIcon icon={faInstagram} style={{ fontSize: 15, color: 'inherit' }} />
              </SocialBtn>
            </div>
          </div>

          {/* ── Colonne 2 : Navigation ── */}
          <div className="flex flex-col gap-4 items-center md:items-start">
            <h3
              className="uppercase tracking-[2px]"
              style={{ fontSize: 10, color: '#C8860A', fontWeight: 700 }}
            >
              Navigation
            </h3>
            <nav className="flex flex-col gap-2.5">
              {NAV.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm transition-all duration-200 hover:translate-x-1"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.9)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Colonne 3 : Contact ── */}
          <div className="flex flex-col gap-4 items-center md:items-start">
            <h3
              className="uppercase tracking-[2px]"
              style={{ fontSize: 10, color: '#C8860A', fontWeight: 700 }}
            >
              Contact
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <FontAwesomeIcon icon={faPhone} style={{ fontSize: 13, color: '#25D366' }} />
                  620326981
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: 13, color: '#C8860A' }} />
                Livraison à Conakry
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <FontAwesomeIcon icon={faClock} style={{ fontSize: 13, color: '#C8860A' }} />
                Lun–Sam, 8h–20h
              </li>
            </ul>

            {/* Pills info */}
            <div className="flex flex-wrap gap-2 mt-1">
              {PILLS.map(({ icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium"
                  style={{
                    background: 'rgba(200,134,10,0.08)',
                    border:     '1px solid rgba(200,134,10,0.15)',
                    color:      'rgba(255,255,255,0.6)',
                  }}
                >
                  <FontAwesomeIcon icon={icon} style={{ fontSize: 10, color: '#C8860A' }} />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            © 2025 Guinée Makiti. Tous droits réservés.
          </p>
          <p style={{ fontSize: 10, color: '#C8860A' }}>
            guineemakiti.com
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ href, label, hoverColor, children }: {
  href: string; label: string; hoverColor: string; children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:opacity-80"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border:     '1px solid rgba(255,255,255,0.1)',
        color:      hoverColor,
      }}
    >
      {children}
    </a>
  );
}
