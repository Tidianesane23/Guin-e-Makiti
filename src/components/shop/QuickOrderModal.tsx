'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@/src/lib/icons';
import type { Product } from '@/src/types';
import { generateWhatsAppLink } from '@/src/lib/whatsapp';
import { createOrder } from '@/src/lib/services/orders.service';
import { decrementStock } from '@/src/lib/services/products.service';
import { formatPrice } from '@/src/lib/formatters';
import { useOrderHistory } from '@/src/hooks/useOrderHistory';
import { useAuth } from '@/src/hooks/useAuth';

interface QuickOrderModalProps {
  product:        Product;
  quantity:       number;
  onClose:        (newStock?: number) => void;
  initialVariant?: string;
}

export default function QuickOrderModal({ product, quantity, onClose, initialVariant }: QuickOrderModalProps) {
  const router = useRouter();
  const { addOrder } = useOrderHistory();
  const { user } = useAuth();

  const variants      = (product.variant_names ?? []).filter(Boolean);
  const hasVariants   = variants.length > 1;

  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [variant,  setVariant]  = useState(initialVariant ?? '');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata ?? {};
    const fullName = [meta.first_name, meta.last_name].filter(Boolean).join(' ');
    if (fullName) setName(fullName);
    if (meta.phone) setPhone(meta.phone);
  }, [user]);

  const effectivePrice = product.promo_price ?? product.price;
  const total          = effectivePrice * quantity;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim())  { setError('Veuillez entrer votre nom.'); return; }
    if (!phone.trim()) { setError('Veuillez entrer votre numéro WhatsApp.'); return; }
    if (hasVariants && !variant) { setError('Veuillez choisir un modèle.'); return; }

    setError('');
    setLoading(true);

    // 1. Ouvrir WhatsApp immédiatement (avant tout async pour éviter le blocage popup)
    const selectedVariant = hasVariants ? variant : undefined;
    const link = generateWhatsAppLink([{ product, quantity, variant: selectedVariant }], name.trim());
    window.open(link, '_blank', 'noopener,noreferrer');

    // 2. Créer la commande dans Supabase
    try {
      const order = await createOrder({
        customer_name:  name.trim(),
        customer_phone: phone.trim().replace(/\D/g, ''),
        customer_email: user?.email ?? undefined,
        items:          [{ product, quantity, variant: selectedVariant }],
        total_amount:   total,
        notes:          selectedVariant ? `Modèle : ${selectedVariant}` : undefined,
        user_id:        user?.id,
      });

      // 3. Décrémenter le stock
      decrementStock(product.id, quantity, selectedVariant).catch(() => {});

      // 4. Notifications (non-bloquant)
      fetch('/api/notify-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }).catch(() => {});
      if (order.customer_email) {
        fetch('/api/notify-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order, status: 'en_attente' }) }).catch(() => {});
      }

      // 5. Sauvegarder dans localStorage pour le suivi
      addOrder({
        id:        order.id,
        shortId:   order.id.slice(0, 8).toUpperCase(),
        nom:       name.trim(),
        total,
        createdAt: order.created_at,
      });

      // 6. Rediriger vers la confirmation
      router.push(
        `/commande-confirmee?id=${order.id}&nom=${encodeURIComponent(name.trim())}&total=${total}`,
      );
    } catch {
      // Commande non enregistrée mais WhatsApp déjà ouvert
      setLoading(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-noir">Vos coordonnées</h2>
          <button
            onClick={() => onClose()}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faTimes} style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Récap produit */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-noir">{product.name}</p>
            <p className="text-xs text-gray-500">
              Qté&nbsp;: {quantity} ·{' '}
              <span className="font-bold" style={{ color: '#C8860A' }}>{formatPrice(total)}</span>
            </p>
          </div>
        </div>

        {/* Sélecteur de variante */}
        {hasVariants && (
          <div className="mb-1">
            <p className="mb-2 text-sm font-medium text-noir">
              Choisissez un modèle <span className="text-rouge">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, i) => {
                const img = product.images?.[i];
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                      variant === v
                        ? 'border-rouge bg-rouge/5 text-rouge'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={v} className="h-6 w-6 rounded-md object-cover" />
                    )}
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-noir">Nom complet</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mamadou Diallo"
              autoFocus
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-noir">Numéro WhatsApp</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="224 6XX XX XX XX"
              type="tel"
              className={inputCls}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#C0392B' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: '#25D366' }}
          >
            {loading
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 18 }} />
              : <WhatsAppIcon />
            }
            {loading ? 'Envoi…' : 'Confirmer et ouvrir WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]';
