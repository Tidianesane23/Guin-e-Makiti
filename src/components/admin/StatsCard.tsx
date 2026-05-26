import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { cn } from '@/src/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: IconDefinition;
  color: 'blue' | 'green' | 'orange' | 'red';
  trend?: { label: string; up: boolean };
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500'   },
  green:  { bg: 'bg-green-50',  icon: 'text-green-500'  },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500' },
  red:    { bg: 'bg-red-50',    icon: 'text-rouge'       },
};

export default function StatsCard({ title, value, icon, color, trend }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-noir">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium', trend.up ? 'text-green-600' : 'text-rouge')}>
              {trend.up ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', c.bg)}>
          <FontAwesomeIcon icon={icon} style={{ fontSize: 22 }} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
