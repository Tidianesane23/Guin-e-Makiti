'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '@/src/types';

const STORAGE_KEY = 'guinee_makiti_cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // corrupted storage — start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && (i.variant ?? '') === (variant ?? ''),
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && (i.variant ?? '') === (variant ?? '')
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity, variant }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce(
    (sum, { product, quantity }) => sum + (product.promo_price ?? product.price) * quantity,
    0
  );

  const itemCount = items.reduce((sum, { quantity }) => sum + quantity, 0);

  return { items, total, itemCount, hydrated, addItem, removeItem, updateQuantity, clearCart };
}
