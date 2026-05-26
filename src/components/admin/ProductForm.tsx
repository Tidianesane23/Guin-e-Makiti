'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faUpload, faSpinner } from '@/src/lib/icons';
import type { Product, Category } from '@/src/types';
import {
  createProduct,
  updateProduct,
  type ProductFormData,
} from '@/src/lib/services/products.service';
import { uploadProductImage } from '@/src/lib/services/storage.service';
import Button from '@/src/components/ui/Button';

interface ProductFormProps {
  product?: Product;
  categories?: Category[];
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ProductForm({ product, categories = [] }: ProductFormProps) {
  const router    = useRouter();
  const isEdit    = !!product;
  const uploadRef = useRef(crypto.randomUUID()); // stable folder prefix for new product images

  const [name,        setName]        = useState(product?.name        ?? '');
  const [slug,        setSlug]        = useState(product?.slug        ?? '');
  const [categoryId,  setCategoryId]  = useState(product?.category_id ?? '');
  const [price,       setPrice]       = useState(String(product?.price ?? ''));
  const [promoPrice,  setPromoPrice]  = useState(String(product?.promo_price ?? ''));
  const [stock,       setStock]       = useState(String(product?.stock ?? ''));
  const [description, setDescription] = useState(product?.description ?? '');
  const [isActive,    setIsActive]    = useState(product?.is_active   ?? true);
  const [isFeatured,  setIsFeatured]  = useState(product?.is_featured ?? false);
  const [chars, setChars] = useState<{ key: string; value: string }[]>(
    Object.entries(product?.characteristics ?? {}).map(([key, value]) => ({ key, value })),
  );
  const [images,    setImages]    = useState<string[]>(product?.images ?? []);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(slugify(v));
  };

  const addChar    = () => setChars((c) => [...c, { key: '', value: '' }]);
  const removeChar = (i: number) => setChars((c) => c.filter((_, idx) => idx !== i));
  const updateChar = (i: number, field: 'key' | 'value', v: string) =>
    setChars((c) => c.map((item, idx) => (idx === i ? { ...item, [field]: v } : item)));

  const removeImage = (i: number) => setImages((imgs) => imgs.filter((_, idx) => idx !== i));

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const folder = product?.id ?? uploadRef.current;
      const url = await uploadProductImage(file, folder);
      setImages((imgs) => [...imgs, url]);
    } catch {
      // upload failed silently; user can retry
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                    e.name        = 'Requis';
    if (!slug.trim())                    e.slug        = 'Requis';
    if (!categoryId)                     e.categoryId  = 'Requis';
    if (!price || isNaN(Number(price)))  e.price       = 'Prix invalide';
    if (!stock || isNaN(Number(stock)))  e.stock       = 'Stock invalide';
    if (!description.trim())             e.description = 'Requis';
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setErrors({});

    const data: ProductFormData = {
      name:            name.trim(),
      slug:            slug.trim(),
      category_id:     categoryId,
      price:           Number(price),
      promo_price:     promoPrice ? Number(promoPrice) : undefined,
      stock:           Number(stock),
      description:     description.trim(),
      is_active:       isActive,
      is_featured:     isFeatured,
      characteristics: Object.fromEntries(
        chars.filter((c) => c.key.trim()).map((c) => [c.key.trim(), c.value]),
      ),
      images,
    };

    try {
      if (isEdit) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      router.push('/admin/produits');
    } catch {
      setErrors({ form: 'Une erreur est survenue. Réessayez.' });
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {errors.form && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-rouge">{errors.form}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Infos générales */}
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-noir">Informations générales</h2>
            <div className="flex flex-col gap-4">
              <Field label="Nom du produit" error={errors.name}>
                <input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: iPhone 15 Pro Max"
                  className={inputCls(!!errors.name)}
                />
              </Field>

              <Field label="Slug (URL)" error={errors.slug}>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="iphone-15-pro-max"
                  className={inputCls(!!errors.slug)}
                />
              </Field>

              <Field label="Catégorie" error={errors.categoryId}>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputCls(!!errors.categoryId)}
                >
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Description détaillée du produit..."
                  className={inputCls(!!errors.description) + ' resize-none'}
                />
              </Field>
            </div>
          </section>

          {/* Prix & stock */}
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-noir">Prix & stock</h2>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Prix (GNF)" error={errors.price}>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1 000 000"
                  min="0"
                  className={inputCls(!!errors.price)}
                />
              </Field>
              <Field label="Prix promo (GNF)" error="">
                <input
                  type="number"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  placeholder="Optionnel"
                  min="0"
                  className={inputCls(false)}
                />
              </Field>
              <Field label="Stock" error={errors.stock}>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  min="0"
                  className={inputCls(!!errors.stock)}
                />
              </Field>
            </div>
          </section>

          {/* Caractéristiques */}
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-noir">Caractéristiques</h2>
              <button
                type="button"
                onClick={addChar}
                className="flex items-center gap-1.5 text-xs font-semibold text-rouge hover:opacity-70 transition-opacity"
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} /> Ajouter
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {chars.length === 0 && (
                <p className="text-xs text-gray-400">Aucune caractéristique ajoutée</p>
              )}
              {chars.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={c.key}
                    onChange={(e) => updateChar(i, 'key', e.target.value)}
                    placeholder="Clé (ex: RAM)"
                    className={inputCls(false) + ' flex-1'}
                  />
                  <input
                    value={c.value}
                    onChange={(e) => updateChar(i, 'value', e.target.value)}
                    placeholder="Valeur (ex: 8 Go)"
                    className={inputCls(false) + ' flex-1'}
                  />
                  <button
                    type="button"
                    onClick={() => removeChar(i)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-rouge transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: 15 }} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-noir">Images</h2>
            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} style={{ fontSize: 12 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 text-sm text-gray-500 transition-colors hover:border-rouge hover:text-rouge">
              {uploading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 18 }} />
                  Téléchargement…
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} style={{ fontSize: 18 }} />
                  Ajouter une image
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-noir">Visibilité</h2>
            <div className="flex flex-col gap-4">
              <Toggle
                label="Produit actif"
                description="Visible dans la boutique"
                checked={isActive}
                onChange={setIsActive}
              />
              <Toggle
                label="Produit vedette"
                description="Affiché en page d'accueil"
                checked={isFeatured}
                onChange={setIsFeatured}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              <Button type="submit" variant="primary" fullWidth loading={saving}>
                {isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => router.push('/admin/produits')}
              >
                Annuler
              </Button>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors',
    hasError
      ? 'border-rouge bg-red-50 focus:ring-rouge'
      : 'border-gray-200 focus:border-rouge focus:ring-1 focus:ring-rouge',
  ].join(' ');
}

function Field({
  label, error, children,
}: {
  label: string; error: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-noir">{label}</label>
      {children}
      {error && <p className="text-xs text-rouge">{error}</p>}
    </div>
  );
}

function Toggle({
  label, description, checked, onChange,
}: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-noir">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          checked ? 'bg-rouge' : 'bg-gray-200',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </label>
  );
}
