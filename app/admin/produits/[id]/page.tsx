import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getProductById } from '@/src/lib/services/products.service';
import { getCategories } from '@/src/lib/services/categories.service';
import ProductForm from '@/src/components/admin/ProductForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProduitPage({ params }: Props) {
  const { id }     = await params;
  const supabase   = await createSupabaseServerClient();
  const [product, categories] = await Promise.all([
    getProductById(id, supabase),
    getCategories(supabase).catch(() => []),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories} />;
}
