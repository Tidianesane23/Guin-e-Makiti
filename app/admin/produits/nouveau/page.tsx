import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getCategories } from '@/src/lib/services/categories.service';
import ProductForm from '@/src/components/admin/ProductForm';

export default async function NouveauProduitPage() {
  const supabase   = await createSupabaseServerClient();
  const categories = await getCategories(supabase).catch(() => []);
  return <ProductForm categories={categories} />;
}
