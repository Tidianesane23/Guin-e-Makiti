'use client';

import { useState, useEffect } from 'react';
import { getOrders } from '@/src/lib/services/orders.service';
import { formatPrice } from '@/src/lib/formatters';

interface DayData { label: string; revenue: number; orders: number }

export default function RevenueChart() {
  const [days, setDays] = useState<DayData[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    getOrders({ limit: 200 }).then(({ data: orders }) => {
      const result: DayData[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split('T')[0];
        const dayOrders = orders.filter(
          (o) => o.created_at.split('T')[0] === key && o.status !== 'annule',
        );
        return {
          label:   d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((s, o) => s + o.total, 0),
          orders:  dayOrders.length,
        };
      });
      setDays(result);
    }).catch(() => {});
  }, []);

  const maxRev = Math.max(...days.map((d) => d.revenue), 1);

  return (
    <div className="rounded-2xl bg-white shadow-sm p-5">
      <p className="mb-4 text-sm font-semibold text-noir">Revenus — 7 derniers jours</p>
      <div className="flex items-end gap-2 h-28">
        {days.map((d, i) => {
          const pct = Math.max(4, (d.revenue / maxRev) * 100);
          const isHov = hovered === i;
          return (
            <div
              key={d.label}
              className="relative flex-1 flex flex-col items-center gap-1 cursor-default"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isHov && d.revenue > 0 && (
                <div
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg whitespace-nowrap"
                  style={{ background: '#2C1A1A' }}
                >
                  {formatPrice(d.revenue)}
                  <br />
                  <span className="font-normal opacity-70">{d.orders} commande{d.orders > 1 ? 's' : ''}</span>
                </div>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height:     `${pct}%`,
                  background: isHov ? '#2C1A1A' : (d.revenue > 0 ? '#C8860A' : '#F3F4F6'),
                }}
              />
              <span className="text-[9px] text-gray-400 text-center leading-tight">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
