'use client';

import { useState } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';
import type { OrderStatus } from '@/src/types';
import { formatPrice } from '@/src/lib/formatters';
import { cn } from '@/src/lib/utils';

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente:   'bg-yellow-100 text-yellow-700',
  confirme:     'bg-blue-100 text-blue-700',
  en_livraison: 'bg-orange-100 text-orange-700',
  livre:        'bg-green-100 text-green-700',
  annule:       'bg-gray-100 text-gray-500',
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

interface OrdersTableProps {
  orders: AdminOrder[];
  onStatusChange: (id: string, status: OrderStatus) => void;
}

export default function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
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
          {orders.map((o, i) => (
            <tr key={o.id} className={i < orders.length - 1 ? 'border-b border-gray-50' : ''}>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.slice(0, 8)}</td>
              <td className="px-4 py-3 font-medium text-noir">{o.customer_name}</td>
              <td className="px-4 py-3 text-gray-500">{o.customer_phone}</td>
              <td className="max-w-[180px] truncate px-4 py-3 text-gray-500">{o.products}</td>
              <td className="px-4 py-3 font-semibold text-noir">{formatPrice(o.total)}</td>
              <td className="px-4 py-3">
                <div className="relative inline-block">
                  <button
                    onClick={() => setOpenSelect(openSelect === o.id ? null : o.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80',
                      STATUS_COLORS[o.status],
                    )}
                  >
                    {STATUS_LABELS[o.status]}
                    <ChevronDown size={11} />
                  </button>
                  {openSelect === o.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenSelect(null)} />
                      <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                        {ALL_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => { onStatusChange(o.id, s); setOpenSelect(null); }}
                            className={cn(
                              'flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50',
                              s === o.status ? 'text-rouge' : 'text-gray-700',
                            )}
                          >
                            <span className={cn('h-2 w-2 rounded-full', STATUS_COLORS[s].split(' ')[0])} />
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400">{o.created_at.split('T')[0]}</td>
              <td className="px-4 py-3">
                <a
                  href={`https://wa.me/${o.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366]/10 px-2.5 py-1.5 text-xs font-semibold text-[#25D366] transition-opacity hover:opacity-80"
                  aria-label={`WhatsApp ${o.customer_name}`}
                >
                  <MessageCircle size={13} />
                  WA
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
