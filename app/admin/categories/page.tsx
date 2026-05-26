'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faMobileAlt, faHeadphones, faVolumeUp, faHome, faTshirt, faGem, faTag } from '@/src/lib/icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/src/lib/services/categories.service';
import type { Category } from '@/src/types';
import Button from '@/src/components/ui/Button';
import CategoryForm from '@/src/components/admin/CategoryForm';

const ICON_MAP: Record<string, IconDefinition> = {
  smartphones:    faMobileAlt,
  accessoires:    faHeadphones,
  audio:          faVolumeUp,
  electromenager: faHome,
  mode:           faTshirt,
  beaute:         faGem,
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [formMode,   setFormMode]   = useState<'hidden' | 'create' | 'edit'>('hidden');
  const [editing,    setEditing]    = useState<Category | undefined>(undefined);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const openCreate = () => { setEditing(undefined); setFormMode('create'); };
  const openEdit   = (c: Category) => { setEditing(c); setFormMode('edit'); };
  const closeForm  = () => setFormMode('hidden');

  const handleSave = async (data: { name: string; slug: string }) => {
    if (formMode === 'edit' && editing) {
      const updated = await updateCategory(editing.id, data);
      setCategories((cs) => cs.map((c) => c.id === editing.id ? updated : c));
    } else {
      const created = await createCategory(data);
      setCategories((cs) => [...cs, created]);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      setCategories((cs) => cs.filter((c) => c.id !== deleteId));
    } catch { /* ignore */ }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isLoading ? '…' : `${categories.length} catégorie${categories.length !== 1 ? 's' : ''}`}
        </p>
        <Button variant="primary" iconLeft={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 16 }} />} onClick={openCreate}>
          Nouvelle catégorie
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(200,134,10,0.1)', color: '#C8860A' }}>
                    <FontAwesomeIcon icon={ICON_MAP[cat.slug] ?? faTag} style={{ fontSize: 20 }} />
                  </span>
                <div>
                  <p className="font-semibold text-noir">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-noir transition-colors"
                  aria-label="Modifier"
                >
                  <FontAwesomeIcon icon={faEdit} style={{ fontSize: 16 }} />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-rouge transition-colors"
                  aria-label="Supprimer"
                >
                  <FontAwesomeIcon icon={faTrash} style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formMode !== 'hidden' && (
        <CategoryForm
          category={editing}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-bold text-noir">Supprimer cette catégorie ?</h3>
            <p className="mt-1 text-sm text-gray-500">Cette action est irréversible.</p>
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button
                variant="primary"
                fullWidth
                className="bg-rouge"
                loading={deleting}
                onClick={handleDelete}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
