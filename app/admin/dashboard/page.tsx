import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingBag, faChartLine, faBoxOpen, faExclamationTriangle,
  faChevronRight, faExclamationCircle, faEye, faBell,
} from '@/src/lib/icons';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getOrderStats, getOrders } from '@/src/lib/services/orders.service';
import { getProductsAdmin } from '@/src/lib/services/products.service';
import { getViewStats } from '@/src/lib/services/analytics.service';
import { formatPrice } from '@/src/lib/formatters';
import RevenueChart from '@/src/components/admin/RevenueChart';
import type { OrderStatus } from '@/src/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente:   'En attente',
  confirme:     'Confirmée',
  en_livraison: 'En livraison',
  livre:        'Livrée',
  annule:       'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; bar: string }> = {
  en_attente:   { bg: '#FBC02D18', text: '#7a5c00',  bar: '#FBC02D' },
  confirme:     { bg: '#1565C018', text: '#1565C0',  bar: '#1565C0' },
  en_livraison: { bg: '#E6510018', text: '#E65100',  bar: '#E65100' },
  livre:        { bg: '#00994418', text: '#009944',  bar: '#009944' },
  annule:       { bg: '#75757518', text: '#757575',  bar: '#9CA3AF' },
};

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M GNF`;
  if (amount >= 1_000)     return `${(amount / 1_000).toFixed(0)}K GNF`;
  return `${amount} GNF`;
}

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ title, value, sub, icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
        <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${accent}18` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-noir leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [stats, recentOrders, allProducts, viewStats] = await Promise.all([
    getOrderStats(supabase).catch(() => ({
      total: 0, revenue: 0,
      byStatus: { en_attente: 0, confirme: 0, en_livraison: 0, livre: 0, annule: 0 },
    })),
    getOrders({ limit: 6 }, supabase).catch(() => ({ data: [], count: 0 })),
    getProductsAdmin({ limit: 300 }, supabase).catch(() => ({ data: [], count: 0 })),
    getViewStats(supabase).catch(() => ({ total7d: 0, topProducts: [] })),
  ]);

  const outOfStock  = allProducts.data.filter((p) => p.is_active && p.stock === 0);
  const lowStock    = allProducts.data.filter((p) => p.is_active && p.stock > 0 && p.stock <= 5);
  const activeCount = allProducts.data.filter((p) => p.is_active).length;

  const totalOrders = stats.total;
  const activeStatuses: OrderStatus[] = ['en_attente', 'confirme', 'en_livraison', 'livre', 'annule'];

  return (
    <div className="flex flex-col gap-6">

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          title="Commandes"
          value={String(totalOrders)}
          sub={`${stats.byStatus.en_attente} en attente`}
          accent="#1565C0"
          icon={<FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 18 }} />}
        />
        <StatCard
          title="Chiffre d'affaires"
          value={formatRevenue(stats.revenue)}
          sub={`${stats.byStatus.livre} livrées`}
          accent="#009944"
          icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: 18 }} />}
        />
        <StatCard
          title="Produits actifs"
          value={String(activeCount)}
          sub={`${outOfStock.length} en rupture`}
          accent="#C8860A"
          icon={<FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 18 }} />}
        />
        <StatCard
          title="Ruptures"
          value={String(outOfStock.length)}
          sub={lowStock.length > 0 ? `${lowStock.length} en stock limité` : undefined}
          accent="#C0392B"
          icon={<FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: 18 }} />}
        />
        <StatCard
          title="Vues produits (7j)"
          value={String(viewStats.total7d)}
          sub="Pages produit visitées"
          accent="#7C3AED"
          icon={<FontAwesomeIcon icon={faEye} style={{ fontSize: 18 }} />}
        />
      </div>

      {/* Alerte stock limité */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
          <FontAwesomeIcon icon={faExclamationCircle}
            style={{ fontSize: 18, color: '#E65100', marginTop: 2 }} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#E65100' }}>
              {lowStock.length} produit{lowStock.length > 1 ? 's' : ''} en stock limité (≤ 5 unités)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStock.map((p) => (
                <Link key={p.id} href={`/admin/produits/${p.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-2.5 py-1 text-xs font-medium transition-colors hover:border-orange-400"
                  style={{ color: '#2C1A1A' }}>
                  <span className="font-bold" style={{ color: '#E65100' }}>{p.stock}</span>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grille principale */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

        {/* Colonne gauche */}
        <div className="flex flex-col gap-6">

          {/* Commandes récentes */}
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-noir">Commandes récentes</h2>
              <Link href="/admin/commandes"
                className="flex items-center gap-1 text-xs font-medium text-rouge hover:opacity-70 transition-opacity">
                Voir tout <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {recentOrders.data.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">Aucune commande</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Client', 'Articles', 'Total', 'Statut', 'Date'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.data.map((o, i) => {
                      const products = o.items
                        .map((it) => `${it.product?.name ?? '?'} ×${it.quantity}`)
                        .join(', ') || '—';
                      const sc = STATUS_COLORS[o.status];
                      return (
                        <tr key={o.id} className={i < recentOrders.data.length - 1 ? 'border-b border-gray-50' : ''}>
                          <td className="px-5 py-3 font-semibold text-noir">{o.customer_name}</td>
                          <td className="max-w-[180px] truncate px-5 py-3 text-gray-500 text-xs">{products}</td>
                          <td className="px-5 py-3 font-semibold text-noir whitespace-nowrap">{formatPrice(o.total)}</td>
                          <td className="px-5 py-3">
                            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                              style={{ background: sc.bg, color: sc.text }}>
                              {STATUS_LABELS[o.status]}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                            {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Graphique revenus */}
          <RevenueChart />
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6">

          {/* Répartition commandes par statut */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-noir">Répartition des commandes</p>
            <div className="flex flex-col gap-3">
              {activeStatuses.map((status) => {
                const count = stats.byStatus[status] ?? 0;
                const pct   = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                const sc    = STATUS_COLORS[status];
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{STATUS_LABELS[status]}</span>
                      <span className="text-xs font-bold text-noir">{count}
                        <span className="ml-1 font-normal text-gray-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: sc.bar }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top produits vus */}
          {viewStats.topProducts.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-noir flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} style={{ fontSize: 14, color: '#7C3AED' }} />
                Top produits vus (7j)
              </p>
              <ul className="flex flex-col divide-y divide-gray-50">
                {viewStats.topProducts.map((p, i) => (
                  <li key={p.slug} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                      <Link href={`/produit/${p.slug}`} target="_blank"
                        className="text-sm font-medium text-noir truncate hover:text-rouge transition-colors">
                        {p.name}
                      </Link>
                    </div>
                    <span className="shrink-0 text-xs font-bold" style={{ color: '#7C3AED' }}>
                      {p.count} vue{p.count > 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ruptures de stock */}
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <FontAwesomeIcon icon={faBell} style={{ fontSize: 14, color: '#C0392B' }} />
              <h2 className="font-semibold text-noir">Ruptures de stock</h2>
            </div>
            <ul className="flex flex-col divide-y divide-gray-50">
              {outOfStock.length === 0 ? (
                <li className="px-5 py-6 text-center text-sm text-gray-400">Aucune rupture ✓</li>
              ) : (
                outOfStock.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <p className="text-sm font-medium text-noir line-clamp-1">{p.name}</p>
                    <Link href={`/admin/produits/${p.id}`}
                      className="shrink-0 text-xs font-semibold text-rouge hover:opacity-70 transition-opacity">
                      Modifier
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
