'use client';

import { ChevronDown } from 'lucide-react';

const OPTIONS = [
  { value: 'newest',     label: 'Plus récents'    },
  { value: 'price_asc',  label: 'Prix croissant'  },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'popular',    label: 'Populaires'      },
];

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm shadow-sm outline-none transition-colors focus:border-rouge focus:ring-1 focus:ring-rouge"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}
