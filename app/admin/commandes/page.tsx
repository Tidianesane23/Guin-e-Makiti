'use client';

import { useState, useEffect, useMemo, useCallback, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faMinus, faChevronLeft, faChevronRight, faSearch, faPhone, faUser, faStar } from '@/src/lib/icons';
import dynamic from 'next/dynamic';
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  resolveDispute,
} from '@/src/lib/services/orders.service';

const DisputeChatAdmin = dynamic(() => import('@/src/components/shop/DisputeChat'), { ssr: false });
import { getProductsAdmin, incrementStock, decrementStock } from '@/src/lib/services/products.service';
import { formatPrice } from '@/src/lib/formatters';
import { cn } from '@/src/lib/utils';
import type { Order, OrderStatus, Product, CartItem } from '@/src/types';
import Button from '@/src/components/ui/Button';
import OrdersTable, { type AdminOrder } from '@/src/components/admin/OrdersTable';

const ITEMS_PER_PAGE = 10;

type StatusFilter = 'all' | OrderStatus;

const FILTER_LABELS: Record<StatusFilter, string> = {
  all:          'Tous',
  en_attente:   'En attente',
  confirme:     'Confirmé',
  en_livraison: 'En livraison',
  livre:        'Livré',
  annule:       'Annulé',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente:   'En attente',
  confirme:     'Confirmé',
  en_livraison: 'En livraison',
  livre:        'Livré',
  annule:       'Annulé',
};

const STATUS_STYLES: Record<OrderStatus, { background: string; color: string }> = {
  en_attente:   { background: '#FBC02D22', color: '#7a5c00' },
  confirme:     { background: '#1565C022', color: '#1565C0' },
  en_livraison: { background: '#E6510022', color: '#E65100' },
  livre:        { background: '#00994422', color: '#009944' },
  annule:       { background: '#75757522', color: '#757575' },
};

interface NewOrderLine { productId: string; quantity: number }

function orderToAdmin(order: Order): AdminOrder {
  const products = order.items
    .map((it) => `${it.product?.name ?? '?'} x${it.quantity}`)
    .join(', ') || '—';
  return {
    id:             order.id,
    customer_name:  order.customer_name,
    customer_phone: order.customer_phone,
    products,
    total:          order.total,
    status:         order.status,
    created_at:     order.created_at,
    cancel_reason:  order.cancel_reason,
    dispute_reason: order.dispute_reason,
  };
}

// ─── Order detail modal ───────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onProofSaved }: { order: Order; onClose: () => void; onProofSaved?: (id: string, proof: string) => void }) {
  const st = STATUS_STYLES[order.status];
  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const [proof,       setProof]       = useState(order.dispute_proof ?? '');
  const [savingProof, setSavingProof] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Commande</p>
            <p className="font-mono font-bold text-noir">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: st.background, color: st.color }}
            >
              {STATUS_LABELS[order.status]}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-0 divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
          {/* Customer */}
          <div className="px-6 py-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Client</p>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                style={{ background: '#C8860A' }}
              >
                {order.customer_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-noir flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUser} style={{ fontSize: 12, color: '#9CA3AF' }} />
                  {order.customer_name}
                </p>
                <a
                  href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#25D366] font-medium flex items-center gap-1.5 hover:opacity-80"
                >
                  <FontAwesomeIcon icon={faPhone} style={{ fontSize: 11 }} />
                  {order.customer_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Articles ({order.items.length})
            </p>
            <div className="flex flex-col gap-3">
              {order.items.map((item, i) => {
                const price = item.product?.promo_price ?? item.product?.price ?? 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-noir truncate">
                        {item.product?.name ?? 'Produit'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPrice(price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-noir shrink-0">
                      {formatPrice(price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total + notes */}
          <div className="px-6 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm font-semibold text-gray-600">Total</span>
              <span className="text-lg font-bold" style={{ color: '#C8860A' }}>
                {formatPrice(order.total)}
              </span>
            </div>
            {order.notes && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-400 mb-1">Notes client</p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Passée le {date}</span>
              {order.customer_confirmed && (
                <span className="flex items-center gap-1 font-semibold" style={{ color: '#009944' }}>
                  <FontAwesomeIcon icon={faStar} style={{ fontSize: 10 }} />
                  Réceptionnée & évaluée
                </span>
              )}
            </div>
          </div>

          {/* Annulation */}
          {order.cancel_reason && (
            <div className="px-6 py-4 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Motif d&apos;annulation</p>
              <p className="text-sm text-gray-600">{order.cancel_reason}</p>
            </div>
          )}

          {/* Litige livraison — chat en temps réel */}
          {order.dispute_reason && (
            <div className="px-6 py-4 border-t border-gray-50">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#E65100' }}>
                ⚠️ Litige — échange avec le client
              </p>
              <DisputeChatAdmin
                orderId={order.id}
                sender="admin"
                initialDisputeReason={order.dispute_reason}
                disputeStatus={order.dispute_status ?? null}
                onStatusChange={(s) => onProofSaved?.(order.id, s)}
                customerEmail={order.customer_email}
                customerName={order.customer_name}
                orderRef={order.id.slice(0, 8).toUpperCase()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CommandesAdminPage() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [page,         setPage]         = useState(1);
  const [showModal,    setShowModal]    = useState(false);
  const [detailOrder,  setDetailOrder]  = useState<Order | null>(null);
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);

  const [newName,  setNewName]  = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [lines,    setLines]    = useState<NewOrderLine[]>([{ productId: '', quantity: 1 }]);
  const [formErr,  setFormErr]  = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      getOrders({ limit: 200 }),
      getProductsAdmin({ limit: 300 }),
    ])
      .then(([{ data: orders }, { data: products }]) => {
        setOrders(orders);
        setProducts(products.filter((p) => p.is_active && p.stock > 0));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const order     = orders.find((o) => o.id === id);
    const prevStatus = order?.status;
    setOrders((os) => os.map((o) => o.id === id ? { ...o, status } : o));
    try {
      const updated = await updateOrderStatus(id, status);
      showToast('Statut mis à jour', true);

      // Restaurer le stock si annulation (et n'était pas déjà annulé)
      if (status === 'annule' && prevStatus !== 'annule' && order?.items?.length) {
        Promise.allSettled(
          order.items
            .filter((item) => item.product?.id)
            .map((item) => incrementStock(item.product.id, item.quantity, item.variant)),
        ).catch(() => {});
      }

      // Notification email client (non-bloquant)
      fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated, status }),
      }).catch(() => {});
    } catch {
      if (prevStatus) setOrders((os) => os.map((o) => o.id === id ? { ...o, status: prevStatus } : o));
      showToast('Erreur lors de la mise à jour', false);
    }
  };

  const handleRowClick = (id: string) => {
    const order = orders.find((o) => o.id === id) ?? null;
    setDetailOrder(order);
  };

  const newOrderTotal = lines.reduce((sum, l) => {
    const p = products.find((pr) => pr.id === l.productId);
    return p ? sum + (p.promo_price ?? p.price) * l.quantity : sum;
  }, 0);

  const addLine    = () => setLines((ls) => [...ls, { productId: '', quantity: 1 }]);
  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof NewOrderLine, value: string | number) =>
    setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  const resetModal = () => {
    setNewName(''); setNewPhone(''); setNewNotes('');
    setLines([{ productId: '', quantity: 1 }]);
    setFormErr('');
  };

  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) { setFormErr('Nom et téléphone requis.'); return; }
    const validLines = lines.filter((l) => l.productId);
    if (validLines.length === 0) { setFormErr('Ajoutez au moins un produit.'); return; }

    const items: CartItem[] = validLines.map((l) => ({
      product:  products.find((p) => p.id === l.productId)!,
      quantity: l.quantity,
    }));

    setCreating(true);
    try {
      const order = await createOrder({
        customer_name:  newName.trim(),
        customer_phone: newPhone.trim(),
        items,
        total_amount:   newOrderTotal,
        notes:          newNotes.trim() || undefined,
      });
      setOrders((os) => [order, ...os]);
      // Décrémenter le stock pour chaque article
      Promise.allSettled(
        items.map((item) => decrementStock(item.product.id, item.quantity, item.variant)),
      ).catch(() => {});
      setShowModal(false);
      resetModal();
      showToast('Commande créée', true);
    } catch {
      setFormErr('Erreur lors de la création. Réessayez.');
    }
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(FILTER_LABELS) as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                statusFilter === s ? 'bg-noir text-white' : 'bg-white text-gray-600 hover:bg-gray-100',
              )}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>
        <Button variant="primary" iconLeft={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 16 }} />} onClick={() => setShowModal(true)}>
          Nouvelle commande
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          style={{ fontSize: 14, color: '#9CA3AF' }}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
        />
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="Rechercher par nom ou numéro de téléphone…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-noir focus:ring-1 focus:ring-noir"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} style={{ fontSize: 13 }} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : (
          <OrdersTable
            orders={paginated.map(orderToAdmin)}
            onStatusChange={handleStatusChange}
            onRowClick={handleRowClick}
          />
        )}

        {/* Pagination */}
        {!isLoading && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400">
              {filtered.length} commande{filtered.length !== 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-noir disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 14 }} />
                </button>
                <span className="px-2 text-sm font-medium text-noir">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-noir disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg"
          style={{ background: toast.ok ? '#009944' : '#C0392B' }}
        >
          {toast.msg}
        </div>
      )}

      {/* Order detail modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onProofSaved={(id, val) => {
            const isStatus = val === 'open' || val === 'admin_resolved' || val === 'client_confirmed';
            setOrders((os) => os.map((o) => o.id === id
              ? isStatus ? { ...o, dispute_status: val as Order['dispute_status'] } : { ...o, dispute_proof: val }
              : o,
            ));
            setDetailOrder((prev) => {
              if (!prev) return null;
              return isStatus ? { ...prev, dispute_status: val as Order['dispute_status'] } : { ...prev, dispute_proof: val };
            });
          }}
        />
      )}

      {/* New order modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-noir">Nouvelle commande</h2>
              <button
                onClick={() => { setShowModal(false); resetModal(); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} style={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-noir">Nom client</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Mamadou Diallo" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-noir">Téléphone</label>
                  <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="224621000000" className={inputCls} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-noir">Produits</label>
                  <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs font-semibold text-rouge hover:opacity-70">
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} /> Ajouter
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={l.productId} onChange={(e) => updateLine(i, 'productId', e.target.value)} className={inputCls + ' flex-1'}>
                        <option value="">Sélectionner...</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                        <button type="button" onClick={() => updateLine(i, 'quantity', Math.max(1, l.quantity - 1))} className="flex h-9 w-8 items-center justify-center text-noir hover:bg-gray-50">
                          <FontAwesomeIcon icon={faMinus} style={{ fontSize: 13 }} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                        <button type="button" onClick={() => updateLine(i, 'quantity', l.quantity + 1)} className="flex h-9 w-8 items-center justify-center text-noir hover:bg-gray-50">
                          <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />
                        </button>
                      </div>
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)} className="rounded-lg p-1.5 text-gray-400 hover:text-rouge transition-colors">
                          <FontAwesomeIcon icon={faTimes} style={{ fontSize: 15 }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-noir">Notes</label>
                <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} placeholder="Instructions de livraison…" className={inputCls + ' resize-none'} />
              </div>

              {newOrderTotal > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-600">Total estimé</span>
                  <span className="font-bold text-rouge">{formatPrice(newOrderTotal)}</span>
                </div>
              )}

              {formErr && <p className="text-xs text-rouge">{formErr}</p>}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" fullWidth onClick={() => { setShowModal(false); resetModal(); }}>Annuler</Button>
                <Button type="submit" variant="primary" fullWidth loading={creating}>Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-rouge focus:ring-1 focus:ring-rouge';
