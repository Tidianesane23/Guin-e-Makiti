'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faShoppingCart, faTimes, faShoppingBag } from '@/src/lib/icons';
import { useCart } from '@/src/hooks/useCart';
import LogoText from '@/src/components/ui/LogoText';

const NAV = [
  { label: 'Accueil',    href: '/' },
  { label: 'Boutique',   href: '/boutique' },
  { label: 'Catégories', href: '/categories' },
  { label: 'Suivi',      href: '/suivi-commande' },
  { label: 'Contact',    href: '/contact' },
];

export default function Header() {
  const [scrolled,     setScrolled]     = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const pathname = usePathname();
  const router   = useRouter();
  const { itemCount, hydrated } = useCart();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 120);
    }
  }, [searchOpen]);

  const close = () => setDrawerOpen(false);
  const openSearch  = () => setSearchOpen(true);
  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    closeSearch();
    router.push(`/boutique?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full transition-shadow duration-300"
        style={{
          background:           scrolled ? 'rgba(255,250,248,0.96)' : 'rgba(255,250,248,0.85)',
          backdropFilter:       'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom:         '1px solid rgba(200,134,10,0.15)',
          boxShadow:            scrolled ? '0 2px 12px rgba(44,26,26,0.08)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-14 md:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="flex items-center justify-center rounded-[10px] bg-white overflow-hidden"
              style={{ width: 32, height: 32, boxShadow: '0 1px 6px rgba(44,26,26,0.12)' }}
            >
              <img
                src="/logo.jpeg"
                alt="Guinée Makiti"
                width={38}
                height={38}
                style={{ objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }}
              />
            </div>
            <div className="leading-none hidden sm:block">
              <LogoText size="md" />
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-0.5" style={{ color: '#7A4A3A' }}>
                Qualité · Livraison · Confiance
              </p>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <motion.div
                  key={href}
                  className="relative"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={href} className="relative block py-1">
                    <motion.span
                      className="text-sm"
                      variants={{
                        rest: { color: active ? '#C8860A' : '#2C1A1A' },
                        hover: { color: '#C8860A' },
                      }}
                      transition={{ duration: 0.2 }}
                      style={{ fontWeight: active ? 700 : 500 }}
                    >
                      {label}
                    </motion.span>
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 rounded-full"
                      style={{ background: '#C8860A' }}
                      variants={{
                        rest:  { width: active ? '100%' : '0%' },
                        hover: { width: '100%' },
                      }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button
              aria-label="Rechercher"
              onClick={openSearch}
              className="p-2 rounded-xl transition-colors"
              style={{ background: 'rgba(200,134,10,0.08)', color: '#C8860A' }}
            >
              <FontAwesomeIcon icon={faSearch} style={{ fontSize: 18, width: 18, height: 18 }} />
            </button>

            {/* Panier */}
            <Link
              href="/panier"
              aria-label={`Panier${hydrated && itemCount > 0 ? `, ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''}`}
              className="relative p-2 rounded-xl transition-colors"
              style={{ background: 'rgba(200,134,10,0.08)', color: '#C8860A' }}
            >
              <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: 18, width: 18, height: 18 }} />
              {hydrated && itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold leading-none select-none"
                  style={{ background: '#C8860A', border: '1.5px solid #FFF1EE' }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* CTA Commander — lg+ */}
            <Link
              href="/boutique"
              className="hidden lg:inline-flex items-center gap-1.5 ml-1 rounded-full px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: '#C8860A' }}
            >
              <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 14, width: 14, height: 14 }} />
              Commander
            </Link>

            {/* Burger — mobile */}
            <button
              aria-label="Ouvrir le menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ background: 'rgba(200,134,10,0.08)', color: '#C8860A' }}
            >
              <FontAwesomeIcon icon={faBars} style={{ fontSize: 20, width: 20, height: 20 }} />
            </button>
          </div>
        </div>

        {/* Search bar (slide down) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="search-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' as const }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(200,134,10,0.1)' }}
            >
              <form onSubmit={handleSearchSubmit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{ fontSize: 15, color: '#C8860A', width: 15, height: 15 }}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      border:     '1.5px solid rgba(200,134,10,0.35)',
                      color:      '#2C1A1A',
                    }}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Fermer la recherche"
                  onClick={closeSearch}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
                  style={{ background: 'rgba(44,26,26,0.07)', color: '#7A4A3A' }}
                >
                  <FontAwesomeIcon icon={faTimes} style={{ fontSize: 15, width: 15, height: 15 }} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={closeSearch}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

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
              className="fixed top-0 left-0 z-[60] flex h-full w-72 flex-col shadow-2xl md:hidden"
              style={{ background: '#FFFAF8' }}
            >
              <div className="flex h-14 items-center justify-between px-5" style={{ borderBottom: '1px solid rgba(200,134,10,0.12)' }}>
                <Link href="/" onClick={close} className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-[8px] bg-white overflow-hidden" style={{ width: 32, height: 32 }}>
                    <img src="/logo.jpeg" alt="Guinée Makiti" width={32} height={32} style={{ objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }} />
                  </div>
                  <LogoText size="sm" />
                </Link>
                <button
                  aria-label="Fermer le menu"
                  onClick={close}
                  className="rounded-full p-1.5 transition-colors"
                  style={{ color: '#7A4A3A' }}
                >
                  <FontAwesomeIcon icon={faTimes} style={{ fontSize: 20, width: 20, height: 20 }} />
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
                      className="px-6 py-3.5 text-base font-medium transition-colors duration-200"
                      style={
                        active
                          ? { borderLeft: '3px solid #C8860A', background: 'rgba(200,134,10,0.06)', color: '#C8860A', fontWeight: 700 }
                          : { color: '#2C1A1A' }
                      }
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
                  className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ background: '#C8860A' }}
                >
                  <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 16, width: 16, height: 16 }} />
                  Commander
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
