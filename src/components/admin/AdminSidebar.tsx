'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faTachometerAlt, faBoxOpen, faTag, faShoppingBag,
  faSignOutAlt, faCommentDots, faEye, faGear, faUsers,
} from '@/src/lib/icons';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAuth';

const ADMIN_VISITOR_KEY = 'adminViewingAsUser';

const NAV: { label: string; href: string; icon: IconDefinition }[] = [
  { label: 'Dashboard',   href: '/admin/dashboard',   icon: faTachometerAlt },
  { label: 'Produits',    href: '/admin/produits',     icon: faBoxOpen       },
  { label: 'Catégories',  href: '/admin/categories',   icon: faTag           },
  { label: 'Commandes',   href: '/admin/commandes',    icon: faShoppingBag   },
  { label: 'Clients',     href: '/admin/clients',      icon: faUsers         },
  { label: 'Avis',        href: '/admin/avis',         icon: faCommentDots   },
  { label: 'Paramètres',  href: '/admin/parametres',   icon: faGear          },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/admin/login');
  };

  const handleViewAsUser = () => {
    localStorage.setItem(ADMIN_VISITOR_KEY, '1');
    onClose?.();
    router.push('/');
  };

  return (
    <aside className="flex h-full w-60 flex-col" style={{ background: '#1C0A0A', borderRight: '1px solid rgba(200,134,10,0.15)' }}>

      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="flex flex-col leading-none" onClick={onClose}>
          <span className="text-xl font-bold tracking-tight text-white">
            Guinée <span style={{ color: '#C8860A' }}>Makiti</span>
          </span>
        </Link>
        <span
          className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ background: 'rgba(200,134,10,0.15)', color: '#C8860A', border: '1px solid rgba(200,134,10,0.3)' }}
        >
          Admin
        </span>
      </div>

      <div className="mx-3 mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                active
                  ? 'border-l-[3px] pl-[9px]'
                  : 'hover:bg-white/5',
              )}
              style={active
                ? { borderColor: '#C8860A', background: 'rgba(200,134,10,0.1)', color: '#C8860A' }
                : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="flex flex-col gap-1 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Voir en tant que client */}
        <button
          onClick={handleViewAsUser}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          <FontAwesomeIcon icon={faEye} style={{ fontSize: 16 }} className="shrink-0" />
          Vue client
        </button>

        {/* Déconnexion */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,57,43,0.12)'; e.currentTarget.style.color = '#FF6B6B'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: 16 }} className="shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
