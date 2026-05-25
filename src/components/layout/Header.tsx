'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/src/hooks/useCart';
import { cn } from '@/src/lib/utils';

const NAV = [
  { label: 'Accueil',    href: '/' },
  { label: 'Boutique',   href: '/boutique' },
  { label: 'Catégories', href: '/categories' },
  { label: 'Contact',    href: '/contact' },
];

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

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Guinée Makiti"
              width={160}
              height={56}
              className="h-10 sm:h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Nav desktop */}
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

          {/* Right actions */}
          <div className="flex items-center gap-1">
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

            {/* CTA Commander — desktop */}
            <Link
              href="/boutique"
              className="hidden md:inline-flex items-center gap-2 ml-2 bg-jaune text-noir text-sm font-bold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              🛒 Commander
            </Link>

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

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
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
              <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
                <Link href="/" onClick={close}>
                  <Image
                    src="/logo.jpeg"
                    alt="Guinée Makiti"
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <button
                  aria-label="Fermer le menu"
                  onClick={close}
                  className="rounded-full p-1.5 text-noir hover:bg-gray-100 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

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

              <div className="px-5 pb-8 pt-2">
                <Link
                  href="/boutique"
                  onClick={close}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-jaune py-3 font-bold text-noir hover:opacity-90 transition-opacity"
                >
                  🛒 Commander
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
