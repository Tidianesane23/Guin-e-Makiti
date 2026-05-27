'use client';

import { useEffect } from 'react';
import { trackProductView } from '@/src/lib/services/analytics.service';

export default function ViewTracker({ productId, slug }: { productId: string; slug: string }) {
  useEffect(() => {
    trackProductView(productId, slug).catch(() => {});
  }, [productId, slug]);

  return null;
}
