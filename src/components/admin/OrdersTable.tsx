'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faChevronDown, faShare } from '@/src/lib/icons';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guinee-makiti.com';
import type { OrderStatus } from '@/src/types';
import { formatPrice } from '@/src/lib/formatters';

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  products: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente:   'En attente',
  confirme:     'Confirmé',
  en_livraison: 'En livraison',
  livre:        'Livré',
  annule:       'Annulé',
};

const STATUS_STYLES: Record<OrderStatus, { background: string; color: string }> = {
  en_attente:   { background: '#FBC02D', color: '#000' },
  confirme:     { background: '#1565C0', color: '#fff' },
  en_livraison: { background: '#E65100', color: '#fff' },
  livre:        { background: '#009944', color: '#fff' },
  annule:       { background: '#757575', color: '#fff' },
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

interface OrdersTableProps {
  orders: AdminOrder[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  onRowClick?: (id: string) => void;
}

export default function OrdersTable({ orders, onStatusChange, onRowClick }: OrdersTableProps) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">Aucune commande trouvée</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['#', 'Client', 'Tél.', 'Articles', 'Total', 'Statut', 'Date', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => {
            const style = STATUS_STYLES[o.status];
            return (
              <tr
                key={o.id}
                onClick={() => onRowClick?.(o.id)}
                className={`${i < orders.length - 1 ? 'border-b border-gray-50' : ''} ${onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-medium text-noir">{o.customer_name}</td>
                <td className="px-4 py-3 text-gray-500">{o.customer_phone}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-gray-500">{o.products}</td>
                <td className="px-4 py-3 font-semibold text-noir">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setOpenSelect(openSelect === o.id ? null : o.id)}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
                      style={style}
                    >
                      {STATUS_LABELS[o.status]}
                      <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 11 }} />
                    </button>
                    {openSelect === o.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenSelect(null)} />
                        <div className="absolute left-0 top-full z-20 mt-1 min-w-[148px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                          {ALL_STATUSES.map((s) => {
                            const st = STATUS_STYLES[s];
                            return (
                              <button
                                key={s}
                                onClick={() => { onStatusChange(o.id, s); setOpenSelect(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ background: st.background }}
                                />
                                {STATUS_LABELS[s]}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{o.created_at.split('T')[0]}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`https://wa.me/${o.customer_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366]/10 px-2.5 py-1.5 text-xs font-semibold text-[#25D366] transition-opacity hover:opacity-80"
                      aria-label={`WhatsApp ${o.customer_name}`}
                    >
                      <FontAwesomeIcon icon={faCommentDots} style={{ fontSize: 13 }} />
                      WA
                    </a>
                    <a
                      href={`https://wa.me/${o.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${o.customer_name} 👋\n\nVotre commande est en cours. Suivez-la ici :\n${SITE_URL}/suivi-commande\n\nRéférence : #${o.id.slice(0, 8).toUpperCase()}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-opacity hover:opacity-80"
                      aria-label={`Envoyer lien de suivi à ${o.customer_name}`}
                      title="Envoyer lien de suivi"
                    >
                      <FontAwesomeIcon icon={faShare} style={{ fontSize: 13 }} />
                      Suivi
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
