import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getProductBySlug } from '@/src/lib/services/products.service';
import ProductGallery from '@/src/components/shop/ProductGallery';
import ProductInfo from '@/src/components/shop/ProductInfo';
import RelatedProducts from '@/src/components/shop/RelatedProducts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const product  = await getProductBySlug(slug, supabase);
  if (!product) return { title: 'Produit introuvable — Guinée Makiti' };
  return {
    title: `${product.name} — Guinée Makiti`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

export default async function ProduitPage({ params }: Props) {
  const { slug }  = await params;
  const supabase  = await createSupabaseServerClient();
  const product   = await getProductBySlug(slug, supabase);
  if (!product) notFound();

  const category = product.category;
  const images   = product.images?.length ? product.images : product.image_url ? [product.image_url] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="transition-colors hover:text-rouge">Accueil</Link>
          <ChevronRight size={14} className="shrink-0" />
          <Link href="/boutique" className="transition-colors hover:text-rouge">Boutique</Link>
          {category && (
            <>
              <ChevronRight size={14} className="shrink-0" />
              <Link
                href={`/boutique?categorie=${category.slug}`}
                className="transition-colors hover:text-rouge"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="shrink-0" />
          <span className="line-clamp-1 font-medium text-noir">{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-[55fr_45fr]">
          <ProductGallery images={images} name={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Related products */}
        <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
      </div>
    </div>
  );
}
