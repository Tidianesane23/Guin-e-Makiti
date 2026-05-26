'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faStar, faSpinner } from '@/src/lib/icons';
import { getAllReviews, approveReview, deleteReview } from '@/src/lib/services/reviews.service';
import type { Review } from '@/src/lib/services/reviews.service';

type ReviewWithApproved = Review & { approved: boolean };

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          style={{ fontSize: 12, color: i < rating ? '#C8860A' : '#E5E7EB' }}
        />
      ))}
    </div>
  );
}

export default function AvisAdminPage() {
  const [reviews,  setReviews]  = useState<ReviewWithApproved[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<'pending' | 'approved'>('pending');
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [busy,     setBusy]     = useState<string | null>(null);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    getAllReviews()
      .then(setReviews)
      .catch(() => showToast('Erreur lors du chargement', false))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleApprove = async (id: string) => {
    setBusy(id);
    try {
      await approveReview(id);
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: true } : r));
      showToast('Avis approuvé', true);
    } catch {
      showToast('Erreur lors de l\'approbation', false);
    }
    setBusy(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet avis définitivement ?')) return;
    setBusy(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Avis supprimé', true);
    } catch {
      showToast('Erreur lors de la suppression', false);
    }
    setBusy(null);
  };

  const pending  = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);
  const shown    = tab === 'pending' ? pending : approved;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-noir">Modération des avis</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Approuvez ou supprimez les avis clients avant publication
          </p>
        </div>
        {pending.length > 0 && (
          <span className="rounded-full bg-rouge px-3 py-1 text-xs font-bold text-white">
            {pending.length} en attente
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {(['pending', 'approved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors"
            style={tab === t ? { background: '#fff', color: '#2C1A1A', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#6B7280' }}
          >
            {t === 'pending' ? `En attente (${pending.length})` : `Approuvés (${approved.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {tab === 'pending' ? 'Aucun avis en attente' : 'Aucun avis approuvé'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {shown.map((r) => (
              <div key={r.id} className="flex items-start gap-4 px-5 py-4">
                {/* Avatar */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: '#C8860A' }}
                >
                  {r.customer_name.slice(0, 2).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-noir">{r.customer_name}</p>
                    <StarRow rating={r.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {r.product_names && (
                    <p className="mb-1 text-[11px] font-medium" style={{ color: '#C8860A' }}>
                      {r.product_names}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3">{r.comment}</p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {!r.approved && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={busy === r.id}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ background: '#009944' }}
                    >
                      {busy === r.id
                        ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 12 }} />
                        : <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12 }} />
                      }
                      Approuver
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={busy === r.id}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rouge transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy === r.id
                      ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 12 }} />
                      : <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
                    }
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  );
}
