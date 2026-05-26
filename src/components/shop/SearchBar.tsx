'use client';

import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@/src/lib/icons';
import { cn } from '@/src/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher un produit...',
  className,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  // Sync external reset (e.g. "Réinitialiser")
  useEffect(() => { setLocal(value); }, [value]);

  // Debounced emit
  useEffect(() => {
    const id = setTimeout(() => { onChangeRef.current(local); }, 300);
    return () => clearTimeout(id);
  }, [local]);

  return (
    <div className={cn('relative', className)}>
      <FontAwesomeIcon
        icon={faSearch}
        style={{ fontSize: 17 }}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm shadow-sm outline-none transition-colors focus:border-rouge focus:ring-1 focus:ring-rouge"
      />
      {local && (
        <button
          type="button"
          aria-label="Effacer"
          onClick={() => { setLocal(''); onChangeRef.current(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: 15 }} />
        </button>
      )}
    </div>
  );
}
