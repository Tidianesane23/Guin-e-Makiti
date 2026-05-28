'use client';

import { useState, useEffect, useCallback } from 'react';

const KEY = 'makiti_wishlist';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => { setIds(read()); }, []);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isWished = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, toggle, isWished, count: ids.length };
}
