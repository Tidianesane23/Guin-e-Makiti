'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faShoppingCart, faCheck, faTruck, faShieldAlt } from '@/src/lib/icons';
import type { Product } from '@/src/types';
import { useCart } from '@/src/hooks/useCart';
import { formatPrice } from '@/src/lib/formatters';
import Button from '@/src/components/ui/Button';
import QuickOrderModal from '@/src/components/shop/QuickOrderModal';
import Badge from '@/src/components/ui/Badge';
import StockIndicator from '@/src/components/ui/StockIndicator';

interface ProductInfoProps {
  product: Product;
  selectedVariant?: string;
  onVariantChange?: (v: string) => void;
}

export default function ProductInfo({ product, selectedVariant = '', onVariantChange }: ProductInfoProps) {
  const { name, price, promo_price, characteristics, description } = product;
  const [quantity,    setQuantity]    = useState(1);
  const [added,       setAdded]       = useState(false);
  const [localStock,  setLocalStock]  = useState(product.stock);
  const [showModal,   setShowModal]   = useState(false);
  const { addItem } = useCart();

  const variants    = (product.variant_names ?? []).filter(Boolean);
  const hasVariants = variants.length > 1;

  const variantIdx  = selectedVariant
    ? (product.variant_names ?? []).indexOf(selectedVariant)
    : -1;
  const variantStock = variantIdx >= 0 && product.variant_stocks?.length
    ? (product.variant_stocks[variantIdx] ?? localStock)
    : localStock;

  const isOutOfStock   = variantStock === 0;
  const hasPromo       = promo_price !== undefined && promo_price < price;
  const effectivePrice = promo_price ?? price;
  const discount       = hasPromo ? Math.round(((price - promo_price!) / price) * 100) : 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleModalClose = (newStock?: number) => {
    setShowModal(false);
    if (newStock !== undefined) setLocalStock(newStock);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Badges + title */}
      <div>
        {(isOutOfStock || hasPromo) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {isOutOfStock && <Badge variant="rupture" />}
            {hasPromo && !isOutOfStock && <Badge variant="promo" />}
          </div>
        )}
        <h1 className="text-2xl font-bold leading-snug text-noir md:text-3xl">{name}</h1>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className={`text-3xl font-bold ${hasPromo ? 'text-rouge' : 'text-noir'}`}>
          {formatPrice(effectivePrice)}
        </span>
        {hasPromo && (
          <>
            <span className="text-lg text-gray-400 line-through">{formatPrice(price)}</span>
            <span className="rounded-full bg-rouge/10 px-2 py-0.5 text-sm font-semibold text-rouge">
              -{discount}%
            </span>
          </>
        )}
      </div>

      {/* Variant selector */}
      {hasVariants && (
        <div>
          <p className="mb-2 text-sm font-semibold text-noir">
            Modèle <span className="text-rouge">*</span>
            {selectedVariant && (
              <span className="ml-2 font-normal text-gray-500">— {selectedVariant}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => {
              const img  = product.images?.[i];
              const stk  = product.variant_stocks?.[i] ?? null;
              const outOfStock = stk !== null && stk === 0;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => !outOfStock && onVariantChange?.(v)}
                  disabled={outOfStock}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedVariant === v
                      ? 'border-rouge bg-rouge/5 text-rouge shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={v} className="h-7 w-7 rounded-lg object-cover" />
                  )}
                  <span>
                    {v}
                    {stk !== null && (
                      <span className="ml-1 text-[11px] font-normal text-gray-400">
                        ({stk > 0 ? `${stk} restants` : 'épuisé'})
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>

      {/* Stock indicator */}
      <StockIndicator stock={variantStock} />

      {/* Quantity + Add to cart */}
      {!isOutOfStock && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Diminuer la quantité"
              className="flex h-10 w-10 items-center justify-center text-noir transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faMinus} style={{ fontSize: 16 }} />
            </button>
            <span className="w-12 text-center text-sm font-semibold text-noir">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(localStock, q + 1))}
              disabled={quantity >= variantStock}
              aria-label="Augmenter la quantité"
              className="flex h-10 w-10 items-center justify-center text-noir transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 16 }} />
            </button>
          </div>

          <div className="flex-1">
            <Button
              variant={added ? 'secondary' : 'primary'}
              onClick={handleAddToCart}
              fullWidth
              iconLeft={
                added
                  ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 16 }} />
                  : <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: 16 }} />
              }
            >
              {added ? 'Ajouté !' : 'Ajouter au panier'}
            </Button>
          </div>
        </div>
      )}

      {/* WhatsApp CTA */}
      <button
        type="button"
        onClick={isOutOfStock ? undefined : () => setShowModal(true)}
        disabled={isOutOfStock}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity ${
          isOutOfStock
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-[#25D366] text-white hover:opacity-90'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        {isOutOfStock ? 'Indisponible' : 'Commander via WhatsApp'}
      </button>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FontAwesomeIcon icon={faTruck} style={{ fontSize: 15 }} className="text-vert" />
          Livraison à Conakry
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: 15 }} className="text-vert" />
          Paiement à la livraison
        </div>
      </div>

      {/* Characteristics */}
      {characteristics && Object.keys(characteristics).length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Caractéristiques
          </h3>
          <dl className="overflow-hidden rounded-xl border border-gray-100">
            {Object.entries(characteristics).map(([key, value], i, arr) => (
              <div
                key={key}
                className={`flex px-4 py-2.5 text-sm ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <dt className="w-2/5 shrink-0 font-medium text-gray-500">{key}</dt>
                <dd className="text-noir">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {showModal && (
        <QuickOrderModal
          product={product}
          quantity={quantity}
          initialVariant={selectedVariant || undefined}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
