'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSpinner, faEdit, faTrash } from '@/src/lib/icons';
import { useAuth } from '@/src/hooks/useAuth';
import {
  getProductReviews,
  getProductRating,
  upsertReview,
  deleteProductReview,
  type ProductReview,
} from '@/src/lib/services/reviews.service';

interface ProductReviewsProps {
  productId: string;
}

function StarRow({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <FontAwesomeIcon
          key={n}
          icon={faStar}
          style={{ fontSize: size, color: n <= value ? '#C8860A' : '#E5E7EB' }}
        />
      ))}
    </div>
  );
}

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

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();

  const [reviews,    setReviews]    = useState<ProductReview[]>([]);
  const [rating,     setRating]     = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [loadingList,setLoadingList]= useState(true);

  const [editing,    setEditing]    = useState(false);
  const [myRating,   setMyRating]   = useState(5);
  const [myComment,  setMyComment]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState('');

  const load = useCallback(async () => {
    setLoadingList(true);
    try {
      const [list, ratingData] = await Promise.all([
        getProductReviews(productId),
        getProductRating(productId),
      ]);
      setReviews(list);
      setRating(ratingData);

      if (user) {
        const mine = list.find((r) => r.user_id === user.id);
        if (mine) {
          setMyRating(mine.rating);
          setMyComment(mine.comment ?? '');
        }
      }
    } finally {
      setLoadingList(false);
    }
  }, [productId, user]);

  useEffect(() => { load(); }, [load]);

  const myReview = reviews.find((r) => r.user_id === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myComment.trim()) { setFormError('Veuillez écrire un commentaire.'); return; }
    if (!user) return;

    setFormError('');
    setSaving(true);
    try {
      const name = user.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim()
        : user.email?.split('@')[0] ?? 'Client';
      await upsertReview(productId, user.id, name, myRating, myComment.trim());
      setEditing(false);
      await load();
    } catch {
      setFormError('Erreur lors de la sauvegarde. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    setSaving(true);
    try {
      await deleteProductReview(myReview.id);
      setMyRating(5);
      setMyComment('');
      setEditing(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-noir mb-6">Avis clients</h2>

      {/* Summary */}
      {rating.count > 0 && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold" style={{ color: '#C8860A' }}>
              {rating.avg.toFixed(1)}
            </span>
            <StarRow value={Math.round(rating.avg)} size={14} />
            <span className="mt-1 text-xs text-gray-400">{rating.count} avis</span>
          </div>
        </div>
      )}

      {/* Review form for logged-in users */}
      {user && (
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          {myReview && !editing ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-noir">Votre avis</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(true); setMyRating(myReview.rating); setMyComment(myReview.comment ?? ''); }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <FontAwesomeIcon icon={faEdit} style={{ fontSize: 12 }} />
                    Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
                    Supprimer
                  </button>
                </div>
              </div>
              <StarRow value={myReview.rating} />
              {myReview.comment && (
                <p className="mt-2 text-sm text-gray-700">{myReview.comment}</p>
              )}
            </div>
          ) : editing || !myReview ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-noir">
                {myReview ? 'Modifier votre avis' : 'Laisser un avis'}
              </p>
              <StarPicker value={myRating} onChange={setMyRating} />
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder="Votre avis sur ce produit..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none resize-none transition-colors focus:border-[#C8860A] focus:ring-1 focus:ring-[#C8860A]"
              />
              {formError && <p className="text-xs text-red-500">{formError}</p>}
              <div className="flex gap-2">
                {myReview && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8860A' }}
                >
                  {saving
                    ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 16 }} />
                    : myReview ? 'Enregistrer' : 'Publier l\'avis'
                  }
                </button>
              </div>
            </form>
          ) : null}
        </div>
      )}

      {!user && (
        <p className="mb-6 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm text-center">
          <a href="/compte/connexion" className="font-semibold" style={{ color: '#C8860A' }}>
            Connectez-vous
          </a>{' '}
          pour laisser un avis.
        </p>
      )}

      {/* Reviews list */}
      {loadingList ? (
        <div className="flex justify-center py-8">
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 24, color: '#C8860A' }} />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Aucun avis pour l'instant. Soyez le premier à donner votre avis !
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-noir">
                    {r.reviewer_name ?? 'Client anonyme'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <StarRow value={r.rating} size={13} />
              </div>
              {r.comment && (
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
