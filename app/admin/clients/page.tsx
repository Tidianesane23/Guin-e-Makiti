'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSpinner, faShoppingBag } from '@/src/lib/icons';
import { supabase } from '@/src/lib/supabase';
import { formatPrice } from '@/src/lib/formatters';

interface ClientRow {
  id:         string;
  first_name: string | null;
  last_name:  string | null;
  phone:      string | null;
  address:    string | null;
  gender:     string | null;
  created_at: string;
  order_count: number;
  order_total: number;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (pErr) throw pErr;

        const { data: orders } = await supabase
          .from('orders')
          .select('user_id, total_amount')
          .not('user_id', 'is', null);

        const statsMap = new Map<string, { count: number; total: number }>();
        (orders ?? []).forEach((o) => {
          const s = statsMap.get(o.user_id) ?? { count: 0, total: 0 };
          s.count++;
          s.total += o.total_amount ?? 0;
          statsMap.set(o.user_id, s);
        });

        setClients(
          (profiles ?? []).map((p) => ({
            ...p,
            order_count: statsMap.get(p.id)?.count ?? 0,
            order_total: statsMap.get(p.id)?.total ?? 0,
          })),
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.first_name ?? '').toLowerCase().includes(q) ||
      (c.last_name  ?? '').toLowerCase().includes(q) ||
      (c.phone      ?? '').includes(q)
    );
  });

  const totalOrders  = clients.reduce((s, c) => s + c.order_count, 0);
  const totalRevenue = clients.reduce((s, c) => s + c.order_total, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-noir">Clients</h1>
        <p className="text-sm text-gray-500">Comptes clients inscrits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Clients inscrits',    value: String(clients.length),    icon: faUsers       },
          { label: 'Commandes liées',      value: String(totalOrders),       icon: faShoppingBag },
          { label: "Chiffre d'affaires",   value: formatPrice(totalRevenue), icon: faShoppingBag },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
            <FontAwesomeIcon icon={icon} style={{ fontSize: 20, color: '#C8860A' }} />
            <p className="mt-3 text-2xl font-bold text-noir">{value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par nom ou téléphone…"
        className="w-full max-w-sm rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#C8860A] focus:ring-1 focus:ring-[#C8860A]"
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-12">
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 24, color: '#C8860A' }} />
          <span className="text-sm text-gray-400">Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">
          {search ? 'Aucun client trouvé.' : "Aucun client inscrit pour l'instant."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Client', 'Téléphone', 'Genre', 'Inscrit le', 'Commandes', 'Total'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={i < filtered.length - 1 ? 'border-b border-gray-50' : ''}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: '#C8860A' }}
                      >
                        {(c.first_name?.[0] ?? c.last_name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <span className="font-medium text-noir">
                        {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sans nom'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.gender === 'homme' ? 'Homme' : c.gender === 'femme' ? 'Femme' : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        background: c.order_count > 0 ? '#00994420' : '#f3f4f6',
                        color:      c.order_count > 0 ? '#009944'   : '#9ca3af',
                      }}
                    >
                      {c.order_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#C8860A' }}>
                    {c.order_total > 0 ? formatPrice(c.order_total) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
