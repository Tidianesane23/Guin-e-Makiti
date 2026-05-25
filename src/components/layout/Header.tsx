'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/src/hooks/useCart';
import { cn } from '@/src/lib/utils';

const NAV = [
  { label: 'Accueil', href: '/' },
  { label: 'Boutique', href: '/boutique' },
  { label: 'Catégories', href: '/categories' },
  { label: 'Contact', href: '/contact' },
];

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';
const WA_HREF = `https://wa.me/${WA_NUMBER}`;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const close = () => setDrawerOpen(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full bg-white transition-shadow duration-300',
          scrolled && 'shadow-md',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-16 sm:h-[72px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex flex-col leading-none shrink-0">
            <span className="font-bold text-xl sm:text-2xl tracking-tight">
              <span className="text-noir">Guinée </span>
              <span className="text-rouge">Makiti</span>
            </span>
            <span className="hidden sm:block text-[10px] font-semibold text-vert tracking-[0.2em] uppercase mt-0.5">
              Qualité · Livraison · Confiance
            </span>
          </Link>

          {/* ── Nav desktop ── */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative py-1 text-sm font-medium transition-colors duration-200',
                    active ? 'text-rouge' : 'text-noir hover:text-rouge',
                  )}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-rouge rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              aria-label="Rechercher"
              className="p-2 rounded-full text-noir hover:bg-gray-100 transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link
              href="/panier"
              aria-label={`Panier${hydrated && itemCount > 0 ? `, ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''}`}
              className="relative p-2 rounded-full text-noir hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart size={20} />
              {hydrated && itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-rouge text-white text-[10px] font-bold leading-none select-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* WhatsApp CTA — desktop */}
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 ml-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              <WhatsAppSVG className="h-4 w-4" />
              Commander
            </a>

            {/* Burger — mobile */}
            <button
              aria-label="Ouvrir le menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-full text-noir hover:bg-gray-100 transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={close}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-[60] flex h-full w-72 flex-col bg-white shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
                <Link href="/" onClick={close} className="font-bold text-xl leading-none">
                  <span className="text-noir">Guinée </span>
                  <span className="text-rouge">Makiti</span>
                </Link>
                <button
                  aria-label="Fermer le menu"
                  onClick={close}
                  className="rounded-full p-1.5 text-noir hover:bg-gray-100 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex flex-1 flex-col py-3">
                {NAV.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={close}
                      className={cn(
                        'px-6 py-3.5 text-base font-medium transition-colors duration-200',
                        active
                          ? 'border-l-4 border-rouge bg-rouge/5 text-rouge'
                          : 'text-noir hover:bg-gray-50 hover:text-rouge',
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer CTA */}
              <div className="px-5 pb-8 pt-2">
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <WhatsAppSVG className="h-5 w-5" />
                  Commander via WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function WhatsAppSVG({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
