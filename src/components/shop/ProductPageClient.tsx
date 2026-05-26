'use client';

import { useState } from 'react';
import type { Product } from '@/src/types';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';

interface ProductPageClientProps {
  product: Product;
  images:  string[];
}

export default function ProductPageClient({ product, images }: ProductPageClientProps) {
  const [galleryIndex,    setGalleryIndex]    = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('');

  const handleVariantChange = (variant: string) => {
    setSelectedVariant(variant);
    const idx = (product.variant_names ?? []).indexOf(variant);
    if (idx >= 0) setGalleryIndex(idx);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[55fr_45fr]">
      <ProductGallery
        images={images}
        name={product.name}
        forcedIndex={galleryIndex}
        onIndexChange={setGalleryIndex}
      />
      <ProductInfo
        product={product}
        selectedVariant={selectedVariant}
        onVariantChange={handleVariantChange}
      />
    </div>
  );
}
