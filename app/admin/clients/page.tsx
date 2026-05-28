'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSpinner, faPhone, faShoppingBag } from '@/src/lib/icons';
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
  order_count:  number;
  order_total:  number;
}

export default function AdminClientsPage() {
  const [clients,  setClients]  = useState<ClientRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fetch all profiles
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (pErr) throw pErr;

        // Fetch orders with user_id to compute stats per user
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
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-xl font-bold text-white">Clients</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Comptes clients inscrits
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Clients inscrits', value: clients.length,          icon: faUsers     },
          { label: 'Commandes liées',  value: totalOrders,             icon: faShoppingBag },
          { label: 'Chiffre d\'affaires', value: formatPrice(totalRevenue), icon: faPhone, raw: true },
        ].map(({ label, value, icon, raw }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <FontAwesomeIcon icon={icon} style={{ fontSize: 20, color: '#C8860A' }} />
            <p className="mt-3 text-2xl font-bold text-white">{raw ? value : value}</p>
            <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par nom ou téléphone…"
        className="w-full max-w-sm rounded-xl border px-4 py-2.5 text-sm outline-none"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
        }}
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 24, color: '#C8860A' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {search ? 'Aucun client trouvé.' : 'Aucun client inscrit pour l\'instant.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                {['Client', 'Téléphone', 'Genre', 'Inscrit le', 'Commandes', 'Total'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: '#C8860A' }}
                      >
                        {(c.first_name?.[0] ?? c.last_name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <span className="font-medium text-white">
                        {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sans nom'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {c.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {c.gender === 'homme' ? 'Homme' : c.gender === 'femme' ? 'Femme' : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        background: c.order_count > 0 ? 'rgba(0,153,68,0.15)' : 'rgba(255,255,255,0.06)',
                        color:      c.order_count > 0 ? '#00cc55'              : 'rgba(255,255,255,0.35)',
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
