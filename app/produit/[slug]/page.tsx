import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@/src/lib/icons';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getProductBySlug } from '@/src/lib/services/products.service';
import ProductPageClient from '@/src/components/shop/ProductPageClient';
import RelatedProducts from '@/src/components/shop/RelatedProducts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const product  = await getProductBySlug(slug, supabase);
  if (!product) return { title: 'Produit introuvable — Guinée Makiti' };

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guinee-makiti.com';

  return {
    title: `${product.name} — Guinée Makiti`,
    description: product.description,
    openGraph: {
      type:        'website',
      locale:      'fr_GN',
      url:         `${SITE_URL}/produit/${product.slug}`,
      siteName:    'Guinée Makiti',
      title:       product.name,
      description: product.description,
      images: product.image_url
        ? [{ url: product.image_url, width: 800, height: 800, alt: product.name }]
        : [],
    },
    twitter: {
      card:        'summary_large_image',
      title:       product.name,
      description: product.description,
      images:      product.image_url ? [product.image_url] : [],
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
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} className="shrink-0" />
          <Link href="/boutique" className="transition-colors hover:text-rouge">Boutique</Link>
          {category && (
            <>
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} className="shrink-0" />
              <Link
                href={`/boutique?categorie=${category.slug}`}
                className="transition-colors hover:text-rouge"
              >
                {category.name}
              </Link>
            </>
          )}
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} className="shrink-0" />
          <span className="line-clamp-1 font-medium text-noir">{product.name}</span>
        </nav>

        {/* Main layout */}
        <ProductPageClient product={product} images={images} />

        {/* Related products */}
        <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
      </div>
    </div>
  );
}
