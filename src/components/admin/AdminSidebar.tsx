'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faTachometerAlt, faBoxOpen, faTag, faShoppingBag,
  faExternalLinkAlt, faSignOutAlt, faCommentDots,
} from '@/src/lib/icons';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAuth';

const NAV: { label: string; href: string; icon: IconDefinition }[] = [
  { label: 'Dashboard',   href: '/admin/dashboard',  icon: faTachometerAlt },
  { label: 'Produits',    href: '/admin/produits',    icon: faBoxOpen       },
  { label: 'Catégories',  href: '/admin/categories',  icon: faTag           },
  { label: 'Commandes',   href: '/admin/commandes',   icon: faShoppingBag   },
  { label: 'Avis',        href: '/admin/avis',        icon: faCommentDots   },
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

  return (
    <aside className="flex h-full w-60 flex-col bg-white shadow-[1px_0_0_0_#e5e7eb]">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="flex flex-col leading-none" onClick={onClose}>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-noir">Guinée </span>
            <span className="text-rouge">Makiti</span>
          </span>
        </Link>
        <span className="mt-2 inline-block rounded-full bg-rouge/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rouge">
          Admin
        </span>
      </div>

      <div className="mx-3 mb-3 border-t border-gray-100" />

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
                  ? 'border-l-[3px] border-rouge bg-rouge/5 pl-[9px] text-rouge'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-noir',
              )}
            >
              <FontAwesomeIcon icon={icon} style={{ fontSize: 18 }} className="shrink-0" />
              {label}
            </Link>
          );
        })}

        <Link
          href="/"
          target="_blank"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-noir"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: 18 }} className="shrink-0" />
          Voir le site
        </Link>
      </nav>

      {/* Sign out */}
      <div className="p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-rouge"
        >
          <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: 18 }} className="shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
