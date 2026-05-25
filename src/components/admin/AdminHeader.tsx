'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard':         'Dashboard',
  '/admin/produits':          'Produits',
  '/admin/produits/nouveau':  'Nouveau produit',
  '/admin/categories':        'Catégories',
  '/admin/commandes':         'Commandes',
};

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/'),
  )?.[1] ?? 'Admin';

  return (
    <header className="flex h-14 items-center gap-3 border-b border-gray-100 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Menu"
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-base font-semibold text-noir">{title}</h1>
    </header>
  );
}
