'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'guinee_makiti_orders';

export interface OrderHistoryItem {
  id:        string;
  shortId:   string;
  nom:       string;
  total:     number;
  createdAt: string;
}

export function useOrderHistory() {
  const [history,  setHistory]  = useState<OrderHistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  const addOrder = useCallback((item: OrderHistoryItem) => {
    setHistory(prev => {
      const next = [item, ...prev.filter(o => o.id !== item.id)];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { history, hydrated, addOrder };
}
