import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faChartLine, faBoxOpen, faExclamationTriangle, faChevronRight, faExclamationCircle } from '@/src/lib/icons';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getOrderStats, getOrders } from '@/src/lib/services/orders.service';
import { getProductsAdmin } from '@/src/lib/services/products.service';
import { formatPrice } from '@/src/lib/formatters';
import StatsCard from '@/src/components/admin/StatsCard';
import RevenueChart from '@/src/components/admin/RevenueChart';
import type { OrderStatus } from '@/src/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente:   'En attente',
  confirme:     'Confirmé',
  en_livraison: 'En livraison',
  livre:        'Livré',
  annule:       'Annulé',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente:   'bg-yellow-100 text-yellow-700',
  confirme:     'bg-blue-100 text-blue-700',
  en_livraison: 'bg-orange-100 text-orange-700',
  livre:        'bg-green-100 text-green-700',
  annule:       'bg-gray-100 text-gray-500',
};

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M GNF`;
  if (amount >= 1_000)     return `${(amount / 1_000).toFixed(0)}K GNF`;
  return `${amount} GNF`;
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [stats, recentOrders, allProducts] = await Promise.all([
    getOrderStats(supabase).catch(() => ({ total: 0, revenue: 0, byStatus: { en_attente: 0, confirme: 0, en_livraison: 0, livre: 0, annule: 0 } })),
    getOrders({ limit: 5 }, supabase).catch(() => ({ data: [], count: 0 })),
    getProductsAdmin({ limit: 300 }, supabase).catch(() => ({ data: [], count: 0 })),
  ]);

  const outOfStock  = allProducts.data.filter((p) => p.is_active && p.stock === 0);
  const lowStock    = allProducts.data.filter((p) => p.is_active && p.stock > 0 && p.stock <= 5);
  const activeCount = allProducts.data.filter((p) => p.is_active).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Commandes"
          value={String(stats.total)}
          icon={faShoppingBag}
          color="blue"
          trend={{ label: `${stats.byStatus.en_attente} en attente`, up: false }}
        />
        <StatsCard
          title="Chiffre d'affaires"
          value={formatRevenue(stats.revenue)}
          icon={faChartLine}
          color="green"
        />
        <StatsCard
          title="Produits actifs"
          value={String(activeCount)}
          icon={faBoxOpen}
          color="orange"
        />
        <StatsCard
          title="Ruptures"
          value={String(outOfStock.length)}
          icon={faExclamationTriangle}
          color="red"
        />
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
          <FontAwesomeIcon icon={faExclamationCircle} style={{ fontSize: 18, color: '#E65100', marginTop: 2 }} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#E65100' }}>
              {lowStock.length} produit{lowStock.length > 1 ? 's' : ''} en stock limité (≤ 5 unités)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/produits/${p.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-2.5 py-1 text-xs font-medium transition-colors hover:border-orange-400"
                  style={{ color: '#2C1A1A' }}
                >
                  <span className="font-bold" style={{ color: '#E65100' }}>{p.stock}</span>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Recent orders */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-noir">Commandes récentes</h2>
            <Link
              href="/admin/commandes"
              className="flex items-center gap-1 text-xs font-medium text-rouge hover:opacity-70 transition-opacity"
            >
              Voir tout <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} />
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
                      .map((it) => `${it.product?.name ?? '?'} x${it.quantity}`)
                      .join(', ') || '—';
                    return (
                      <tr key={o.id} className={i < recentOrders.data.length - 1 ? 'border-b border-gray-50' : ''}>
                        <td className="px-5 py-3 font-medium text-noir">{o.customer_name}</td>
                        <td className="max-w-[200px] truncate px-5 py-3 text-gray-500">{products}</td>
                        <td className="px-5 py-3 font-semibold text-noir">{formatPrice(o.total)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}>
                            {STATUS_LABELS[o.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400">{o.created_at.split('T')[0]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stock sidebar */}
        <div className="flex flex-col gap-4">
          {/* Out of stock */}
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-noir">Ruptures de stock</h2>
            </div>
            <ul className="flex flex-col divide-y divide-gray-50">
              {outOfStock.length === 0 ? (
                <li className="px-5 py-6 text-center text-sm text-gray-400">Aucune rupture</li>
              ) : (
                outOfStock.map((p) => (
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

          {/* Revenue chart */}
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}
