'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@/src/lib/icons';
import type { CartItem } from '@/src/types';
import { formatPrice } from '@/src/lib/formatters';
import { generateWhatsAppLink } from '@/src/lib/whatsapp';
import { createOrder } from '@/src/lib/services/orders.service';
import { useCart } from '@/src/hooks/useCart';
import { useOrderHistory } from '@/src/hooks/useOrderHistory';

interface CartSummaryProps {
  items: CartItem[];
}

export default function CartSummary({ items }: CartSummaryProps) {
  const { clearCart } = useCart();
  const { addOrder }  = useOrderHistory();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [notes,     setNotes]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const subtotal = items.reduce(
    (sum, { product, quantity }) => sum + (product.promo_price ?? product.price) * quantity,
    0,
  );

  const handleOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim())  { setError('Veuillez entrer votre nom.'); return; }
    if (!phone.trim()) { setError('Veuillez entrer votre numéro WhatsApp.'); return; }

    setError('');
    setLoading(true);

    try {
      const order = await createOrder({
        customer_name:  name.trim(),
        customer_phone: phone.trim().replace(/\D/g, ''),
        items,
        total_amount:   subtotal,
        notes:          notes.trim() || undefined,
      });

      window.open(generateWhatsAppLink(items, name.trim()), '_blank', 'noopener,noreferrer');
      addOrder({
        id:        order.id,
        shortId:   order.id.slice(0, 8).toUpperCase(),
        nom:       name.trim(),
        total:     subtotal,
        createdAt: order.created_at,
      });
      clearCart();
      router.push(
        `/commande-confirmee?id=${order.id}&nom=${encodeURIComponent(name.trim())}&total=${subtotal}`,
      );
    } catch {
      setError('Une erreur est survenue. Votre commande WhatsApp reste disponible.');
      window.open(generateWhatsAppLink(items, name.trim()), '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-noir">Récapitulatif</h2>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Sous-total</span>
            <span className="font-medium text-noir">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Livraison</span>
            <span className="font-semibold text-vert">Gratuite</span>
          </div>
          <div className="my-1 border-t border-gray-100" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-noir">Total</span>
            <span className="text-2xl font-bold text-rouge">{formatPrice(subtotal)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon />
          Commander via WhatsApp
        </button>

        <div className="mt-4 flex flex-col gap-1.5 text-xs text-gray-500">
          <p>✓ Paiement à la livraison</p>
          <p>✓ Confirmation rapide par WhatsApp</p>
          <p>✓ Livraison à Conakry</p>
        </div>

        <Link
          href="/boutique"
          className="mt-4 flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
        >
          Continuer mes achats
        </Link>
      </div>

      {/* ── Modal coordonnées ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-noir">Vos coordonnées</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} style={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleOrder} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-noir">Nom complet</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mamadou Diallo"
                  className={inputCls}
                  autoFocus
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

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-noir">
                  Notes <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adresse de livraison, instructions..."
                  rows={2}
                  className={inputCls + ' resize-none'}
                />
              </div>

              {error && <p className="text-xs text-rouge">{error}</p>}

              {/* Récap commande */}
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-600">Total commande</span>
                  <span className="font-bold text-rouge">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {items.length} article{items.length > 1 ? 's' : ''}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 18 }} />
                ) : (
                  <WhatsAppIcon />
                )}
                {loading ? 'Enregistrement…' : 'Confirmer et ouvrir WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
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
