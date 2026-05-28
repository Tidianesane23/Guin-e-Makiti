'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingBag, faSignOutAlt, faTruck, faChevronRight } from '@/src/lib/icons';
import { useAuth } from '@/src/hooks/useAuth';

export default function ComptePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/compte/connexion');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#C8860A] border-t-transparent" />
      </div>
    );
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFAF8 60%, #FFF0E0 100%)' }}
    >
      <div className="mx-auto max-w-lg flex flex-col gap-5">
        {/* Avatar + email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-white shadow-sm p-6 flex items-center gap-4"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}
        >
          <div
            className="flex items-center justify-center rounded-full text-white font-bold text-lg shrink-0"
            style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #C8860A, #E6A020)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Connecté en tant que</p>
            <p className="text-sm font-bold text-[#2C1A1A] truncate">{user.email}</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-2xl bg-white shadow-sm overflow-hidden"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}
        >
          <p className="px-6 pt-5 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Mon espace
          </p>

          <AccountLink
            icon={faTruck}
            label="Suivre mes commandes"
            desc="Voir le statut de vos commandes en cours"
            href="/suivi-commande"
          />
          <AccountLink
            icon={faShoppingBag}
            label="Parcourir la boutique"
            desc="Découvrir nos produits disponibles"
            href="/boutique"
          />
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <button
            onClick={async () => { await signOut(); router.push('/'); }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-colors"
            style={{ background: 'rgba(192,57,43,0.07)', color: '#C0392B', border: '1px solid rgba(192,57,43,0.15)' }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: 15 }} />
            Se déconnecter
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function AccountLink({ icon, label, desc, href }: {
  icon: typeof faUser;
  label: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[rgba(200,134,10,0.04)] group"
      style={{ borderTop: '1px solid rgba(200,134,10,0.08)' }}
    >
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 40, height: 40, background: 'rgba(200,134,10,0.1)', color: '#C8860A' }}
      >
        <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2C1A1A]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <FontAwesomeIcon icon={faChevronRight}
        className="opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ fontSize: 12, color: '#C8860A' }} />
    </Link>
  );
}
