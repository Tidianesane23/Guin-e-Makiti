import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@/src/lib/icons';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getRelatedProducts } from '@/src/lib/services/products.service';
import ProductCard from '@/src/components/ui/ProductCard';

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string;
}

export default async function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const supabase = await createSupabaseServerClient();
  const related  = await getRelatedProducts(categoryId, currentProductId, 4, supabase).catch(() => []);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-noir">Produits similaires</h2>
        <Link
          href="/boutique"
          className="flex items-center gap-1 text-sm font-medium text-rouge hover:opacity-70 transition-opacity"
        >
          Voir tout
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 15 }} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
