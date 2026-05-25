import Link from 'next/link';
import { Phone, Clock, MapPin } from 'lucide-react';

const NAV = [
  { label: 'Accueil', href: '/' },
  { label: 'Boutique', href: '/boutique' },
  { label: 'Catégories', href: '/categories' },
  { label: 'Contact', href: '/contact' },
];

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

export default function Footer() {
  return (
    <footer className="bg-noir text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* ── Colonne 1 : Marque ── */}
          <div className="flex flex-col gap-4">
            <div className="leading-none">
              <p className="font-bold text-2xl tracking-tight">
                <span className="text-white">Guinée </span>
                <span className="text-rouge">Makiti</span>
              </p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              La plateforme e-commerce WhatsApp-first pour le marché guinéen.
              Qualité, rapidité et confiance au cœur de chaque commande.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <SocialLink href="https://facebook.com/guineemakiti" label="Facebook">
                <FacebookSVG />
              </SocialLink>
              <SocialLink href="https://instagram.com/guineemakiti" label="Instagram">
                <InstagramSVG />
              </SocialLink>
              <SocialLink href="https://tiktok.com/@guineemakiti" label="TikTok">
                <TikTokSVG />
              </SocialLink>
            </div>
          </div>

          {/* ── Colonne 2 : Navigation ── */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest">
              Navigation
            </h3>
            <nav className="flex flex-col gap-2.5">
              {NAV.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-gray-400 text-sm hover:text-rouge transition-colors duration-200 w-fit"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Colonne 3 : Contact ── */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest">
              Contact
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-[#25D366] transition-colors duration-200"
                >
                  <Phone size={15} className="shrink-0 text-[#25D366]" />
                  <span>+{WA_NUMBER}</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <MapPin size={15} className="shrink-0 text-vert" />
                <span>Livraison rapide à Conakry</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Clock size={15} className="shrink-0 text-jaune" />
                <span>Lun–Sam, 8h–20h</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Guinée Makiti. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-rouge hover:text-white transition-all duration-200"
    >
      {children}
    </a>
  );
}

function FacebookSVG() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function InstagramSVG() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokSVG() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}
