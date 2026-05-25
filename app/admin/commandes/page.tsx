'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { Plus, X, Minus } from 'lucide-react';
import {
  getOrders,
  createOrder,
  updateOrderStatus,
} from '@/src/lib/services/orders.service';
import { getProductsAdmin } from '@/src/lib/services/products.service';
import { formatPrice } from '@/src/lib/formatters';
import { cn } from '@/src/lib/utils';
import type { Order, OrderStatus, Product, CartItem } from '@/src/types';
import Button from '@/src/components/ui/Button';
import OrdersTable, { type AdminOrder } from '@/src/components/admin/OrdersTable';

type StatusFilter = 'all' | OrderStatus;

const FILTER_LABELS: Record<StatusFilter, string> = {
  all:          'Tous',
  en_attente:   'En attente',
  confirme:     'Confirmé',
  en_livraison: 'En livraison',
  livre:        'Livré',
  annule:       'Annulé',
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
  };
}

export default function CommandesAdminPage() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showModal,    setShowModal]    = useState(false);

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

  const filtered = useMemo(() =>
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter),
  [orders, statusFilter]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((os) => os.map((o) => o.id === id ? { ...o, status } : o));
    } catch { /* ignore */ }
  };

  const newOrderTotal = lines.reduce((sum, l) => {
    const p = products.find((pr) => pr.id === l.productId);
    if (!p) return sum;
    return sum + (p.promo_price ?? p.price) * l.quantity;
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
      setShowModal(false);
      resetModal();
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
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                statusFilter === s ? 'bg-noir text-white' : 'bg-white text-gray-600 hover:bg-gray-100',
              )}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>
        <Button variant="primary" iconLeft={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Nouvelle commande
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : (
          <OrdersTable
            orders={filtered.map(orderToAdmin)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

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
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-noir">Nom client</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Mamadou Diallo"
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-noir">Téléphone</label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="224621000000"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-noir">Produits</label>
                  <button type="button" onClick={addLine}
                    className="flex items-center gap-1 text-xs font-semibold text-rouge hover:opacity-70">
                    <Plus size={13} /> Ajouter
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={l.productId}
                        onChange={(e) => updateLine(i, 'productId', e.target.value)}
                        className={inputCls + ' flex-1'}
                      >
                        <option value="">Sélectionner...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                        <button type="button"
                          onClick={() => updateLine(i, 'quantity', Math.max(1, l.quantity - 1))}
                          className="flex h-9 w-8 items-center justify-center text-noir hover:bg-gray-50">
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                        <button type="button"
                          onClick={() => updateLine(i, 'quantity', l.quantity + 1)}
                          className="flex h-9 w-8 items-center justify-center text-noir hover:bg-gray-50">
                          <Plus size={13} />
                        </button>
                      </div>
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-rouge transition-colors">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-noir">Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Instructions de livraison, remarques..."
                  className={inputCls + ' resize-none'}
                />
              </div>

              {newOrderTotal > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-600">Total estimé</span>
                  <span className="font-bold text-rouge">{formatPrice(newOrderTotal)}</span>
                </div>
              )}

              {formErr && <p className="text-xs text-rouge">{formErr}</p>}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" fullWidth onClick={() => { setShowModal(false); resetModal(); }}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" fullWidth loading={creating}>
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-rouge focus:ring-1 focus:ring-rouge';
