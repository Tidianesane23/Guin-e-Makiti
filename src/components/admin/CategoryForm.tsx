'use client';

import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Category } from '@/src/types';
import Button from '@/src/components/ui/Button';

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
  onSave: (data: { name: string; slug: string }) => Promise<void>;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CategoryForm({ category, onClose, onSave }: CategoryFormProps) {
  const [name,   setName]   = useState(category?.name ?? '');
  const [slug,   setSlug]   = useState(category?.slug ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (v: string) => {
    setName(v);
    if (!category) setSlug(slugify(v));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Requis';
    if (!slug.trim()) errs.slug = 'Requis';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await onSave({ name: name.trim(), slug: slug.trim() });
      onClose();
    } catch {
      setErrors({ form: 'Une erreur est survenue.' });
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-noir">
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-noir">Nom</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Smartphones"
              className={inputCls(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-rouge">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-noir">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="smartphones"
              className={inputCls(!!errors.slug)}
            />
            {errors.slug && <p className="text-xs text-rouge">{errors.slug}</p>}
          </div>

          {errors.form && <p className="text-xs text-rouge">{errors.form}</p>}

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary" fullWidth loading={saving}>Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors',
    hasError
      ? 'border-rouge bg-red-50'
      : 'border-gray-200 focus:border-rouge focus:ring-1 focus:ring-rouge',
  ].join(' ');
}
