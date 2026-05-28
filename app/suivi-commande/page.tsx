'use client';

import { useState, useEffect, useCallback, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingBag, faSpinner, faPhone, faStar, faCheckCircle, faRocket } from '@/src/lib/icons';
import { useOrderHistory } from '@/src/hooks/useOrderHistory';
import { useAuth } from '@/src/hooks/useAuth';
import { getOrdersByIds, getOrdersByPhone, getOrdersByUserId, confirmCustomerReceipt } from '@/src/lib/services/orders.service';
import { submitReview } from '@/src/lib/services/reviews.service';
import { decrementStock } from '@/src/lib/services/products.service';
import { formatPrice } from '@/src/lib/formatters';
import type { Order, OrderStatus } from '@/src/types';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STEPS: OrderStatus[] = ['en_attente', 'confirme', 'en_livraison', 'livre'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente:   'Reçue',
  confirme:     'Confirmée',
  en_livraison: 'En livraison',
  livre:        'Livrée',
  annule:       'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  en_attente:   { bg: '#FBC02D22', color: '#7a5c00' },
  confirme:     { bg: '#1565C022', color: '#1565C0' },
  en_livraison: { bg: '#E6510022', color: '#E65100' },
  livre:        { bg: '#00994422', color: '#009944' },
  annule:       { bg: '#75757522', color: '#757575' },
};

function stepIndex(status: OrderStatus): number {
  return STATUS_STEPS.indexOf(status);
}

// ─── Star picker ─────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <FontAwesomeIcon
            icon={faStar}
            style={{ fontSize: 24, color: n <= (hovered || value) ? '#C8860A' : '#D1D5DB' }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Confirmation form (inline inside OrderCard) ──────────────────────────────

interface ConfirmFormProps {
  order: Order;
  onSuccess: () => void;
}

function ConfirmForm({ order, onSuccess }: ConfirmFormProps) {
  const [rating,    setRating]    = useState(5);
  const [comment,   setComment]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [showForm,  setShowForm]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) { setError('Veuillez laisser un commentaire.'); return; }

    setLoading(true);
    setError('');

    // Step 1: save review (non-blocking — won't cancel the confirmation if it fails)
    try {
      const productNames = order.items
        .map((i) => i.product?.name ?? '')
        .filter(Boolean)
        .join(', ');
      await submitReview({
        order_id:      order.id,
        customer_name: order.customer_name,
        rating,
        comment:       comment.trim(),
        product_names: productNames || undefined,
      });
    } catch (reviewErr) {
      console.error('[review] submitReview failed:', (reviewErr as Error)?.message ?? reviewErr);
      // continue — review is secondary, confirmation is primary
    }

    // Step 2: mark order as customer-confirmed (critical)
    try {
      await confirmCustomerReceipt(order.id);
    } catch (confirmErr) {
      console.error('[confirm] confirmCustomerReceipt failed:', confirmErr);
      setError('Erreur lors de la confirmation de commande. Réessayez.');
      setLoading(false);
      return;
    }

    // Step 3: decrement stock
    if (order.items.length > 0) {
      const stockItems = order.items.filter((item) => item.product?.id);
      console.log('[stock] items to decrement:', stockItems.map(i => ({ id: i.product.id, qty: i.quantity })));
      const results = await Promise.allSettled(
        stockItems.map((item) => decrementStock(item.product.id, item.quantity, item.variant)),
      );
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error('[stock] decrement rejected:', stockItems[i]?.product?.id, r.reason);
        else console.log('[stock] decrement ok:', stockItems[i]?.product?.id, r.value);
      });
    }

    onSuccess();
  };

  if (!showForm) {
    return (
      <div className="px-5 pb-5 pt-0">
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(200,134,10,0.07)', border: '1.5px dashed rgba(200,134,10,0.35)' }}
        >
          <p className="text-sm font-semibold text-noir mb-1">
            📦 Avez-vous reçu votre commande ?
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Confirmez la réception et laissez un avis — cela nous aide beaucoup !
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#C8860A' }}
          >
            Confirmer la réception
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-5 pt-0">
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(200,134,10,0.07)', border: '1.5px solid rgba(200,134,10,0.35)' }}
      >
        <p className="text-sm font-bold text-noir mb-4">Confirmer la réception & laisser un avis</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Votre note</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Votre commentaire</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qualité du produit, rapidité de livraison..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none resize-none transition-colors focus:border-[#C8860A] focus:ring-1 focus:ring-[#C8860A]"
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#C0392B' }}>{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: '#009944' }}
            >
              {loading
                ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 16 }} />
                : '✓ Confirmer'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Single order card ────────────────────────────────────────────────────────

function OrderCard({ order, onConfirmed }: { order: Order; onConfirmed?: (id: string) => void }) {
  const isCancelled       = order.status === 'annule';
  const currentStep       = stepIndex(order.status);
  const statusStyle       = STATUS_COLORS[order.status];
  const needsConfirmation = order.status === 'livre' && !order.customer_confirmed;
  const isConfirmed       = order.status === 'livre' && order.customer_confirmed;
  const date              = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
        <div>
          <p className="text-xs text-gray-400 font-medium">Commande</p>
          <p className="font-mono font-bold text-noir">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{date}</p>
          <p className="font-bold" style={{ color: '#C8860A' }}>{formatPrice(order.total)}</p>
        </div>
      </div>

      {/* Items */}
      {order.items.length > 0 && (
        <div className="px-5 py-3 border-b border-gray-50 flex flex-col gap-1.5">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.product?.image_url && (
                <img
                  src={item.product.image_url}
                  alt={item.product?.name}
                  className="h-8 w-8 rounded-lg object-cover shrink-0"
                />
              )}
              <span className="text-gray-700 flex-1 min-w-0 truncate">
                {item.product?.name ?? 'Produit'}
              </span>
              <span className="text-gray-500 shrink-0">×{item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</span>
          <div className="flex items-center gap-1.5">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              {STATUS_LABELS[order.status]}
            </span>
            {isConfirmed && (
              <span className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold"
                style={{ background: '#00994415', color: '#009944' }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 11 }} />
                Réceptionné
              </span>
            )}
          </div>
        </div>

        {isCancelled ? (
          <p className="text-sm text-gray-400 text-center py-2">
            Cette commande a été annulée.
          </p>
        ) : (
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done    = i <= currentStep;
              const active  = i === currentStep;
              const isLast  = i === STATUS_STEPS.length - 1;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-3 w-3 rounded-full border-2 transition-colors"
                      style={{
                        background:  done ? '#009944' : '#fff',
                        borderColor: done ? '#009944' : '#D1D5DB',
                        boxShadow:   active ? '0 0 0 3px rgba(0,153,68,0.2)' : undefined,
                      }}
                    />
                    <span
                      className="mt-1.5 text-[9px] font-medium text-center leading-none"
                      style={{ color: done ? '#009944' : '#9CA3AF', whiteSpace: 'nowrap' }}
                    >
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className="h-0.5 flex-1 mx-1 mb-3 rounded-full"
                      style={{ background: i < currentStep ? '#009944' : '#E5E7EB' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation CTA */}
      {needsConfirmation && (
        <ConfirmForm
          order={order}
          onSuccess={() => onConfirmed?.(order.id)}
        />
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function localOrdersFromHistory(history: import('@/src/hooks/useOrderHistory').OrderHistoryItem[]): Order[] {
  return history.map((h) => ({
    id:                 h.id,
    customer_name:      h.nom,
    customer_phone:     '',
    items:              [],
    total:              h.total,
    status:             'en_attente' as OrderStatus,
    customer_confirmed: false,
    created_at:         h.createdAt,
  }));
}

const POLL_INTERVAL = 30_000; // 30 s

// ─── Main content ─────────────────────────────────────────────────────────────

function SuiviContent() {
  const { history, hydrated } = useOrderHistory();
  const { user } = useAuth();

  const [orders,    setOrders]    = useState<Order[]>([]);
  const [phone,     setPhone]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [refreshing,setRefreshing]= useState(false);
  const [searched,  setSearched]  = useState(false);
  const [error,     setError]     = useState('');
  const [lastSync,  setLastSync]  = useState<Date | null>(null);

  const mergeOrders = (a: Order[], b: Order[]): Order[] => {
    const map = new Map<string, Order>();
    [...a, ...b].forEach((o) => map.set(o.id, o));
    return [...map.values()].sort(
      (x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime(),
    );
  };

  // Fetch real statuses from Supabase and merge with local fallback
  const fetchFromSupabase = useCallback(async (ids: string[], silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [byIds, byUser] = await Promise.all([
        ids.length > 0 ? getOrdersByIds(ids) : Promise.resolve([]),
        user ? getOrdersByUserId(user.id) : Promise.resolve([]),
      ]);
      const merged = mergeOrders(byIds, byUser);
      if (merged.length > 0) {
        setOrders(merged);
        setLastSync(new Date());
      }
    } catch {
      // keep local data
    } finally {
      if (!silent) setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Initial load: show localStorage instantly, then try Supabase
  useEffect(() => {
    if (!hydrated) return;
    if (history.length > 0) setOrders(localOrdersFromHistory(history));
    fetchFromSupabase(history.map((h) => h.id), true);
  }, [hydrated, history, fetchFromSupabase]);

  // Auto-poll every 30s
  useEffect(() => {
    if (!hydrated || searched) return;
    const id = setInterval(() => {
      fetchFromSupabase(history.map((h) => h.id), true);
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [hydrated, history, searched, fetchFromSupabase]);

  const handleRefresh = () => {
    if (searched) return;
    fetchFromSupabase(history.map((h) => h.id), false);
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (!clean) { setError('Entrez votre numéro de téléphone.'); return; }
    setError('');
    setLoading(true);
    try {
      const results = await getOrdersByPhone(clean);
      setOrders(results);
      setSearched(true);
      if (results.length === 0) setError('Aucune commande trouvée pour ce numéro.');
    } catch {
      setError('Erreur lors de la recherche. Réessayez.');
    }
    setLoading(false);
  };

  const handleConfirmed = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => o.id === id ? { ...o, customer_confirmed: true } : o),
    );
  };

  const hasLocalOrders = hydrated && history.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-noir md:text-3xl">Suivre ma commande</h1>
              <p className="mt-1 text-sm text-gray-500">
                Statut mis à jour en temps réel
              </p>
            </div>
            {(hasLocalOrders || user) && !searched && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="shrink-0 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <FontAwesomeIcon
                  icon={faRocket}
                  spin={refreshing}
                  style={{ fontSize: 14, color: '#C8860A' }}
                />
                {refreshing ? 'Mise à jour…' : 'Rafraîchir'}
              </button>
            )}
          </div>
          {lastSync && (
            <p className="mt-2 text-[11px] text-gray-400">
              Dernière mise à jour : {lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 flex flex-col gap-6">

        {/* Phone search */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-noir flex items-center gap-2">
            <FontAwesomeIcon icon={faPhone} style={{ fontSize: 14, color: '#C8860A' }} />
            Rechercher par numéro de téléphone
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="224 6XX XX XX XX"
              type="tel"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#C8860A] focus:ring-1 focus:ring-[#C8860A]"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: '#C8860A' }}
            >
              {loading
                ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 16 }} />
                : <FontAwesomeIcon icon={faSearch} style={{ fontSize: 16 }} />
              }
              {!loading && 'Voir'}
            </button>
          </form>
          {error && <p className="mt-2 text-xs" style={{ color: '#C0392B' }}>{error}</p>}
        </div>

        {/* Orders list */}
        {!hydrated ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {hasLocalOrders && !searched
                ? 'Vos dernières commandes'
                : `${orders.length} commande${orders.length > 1 ? 's' : ''} trouvée${orders.length > 1 ? 's' : ''}`
              }
            </p>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onConfirmed={handleConfirmed} />
            ))}
          </div>
        ) : hydrated && !refreshing && history.length === 0 && !searched && !user ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 52, color: '#D1D5DB' }} />
            <div>
              <p className="font-semibold text-noir">Aucune commande récente</p>
              <p className="mt-1 text-sm text-gray-400">
                Vos commandes apparaîtront ici après votre prochain achat.
              </p>
            </div>
            <Link
              href="/boutique"
              className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#C8860A' }}
            >
              Voir la boutique
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SuiviCommandePage() {
  return (
    <Suspense>
      <SuiviContent />
    </Suspense>
  );
}
