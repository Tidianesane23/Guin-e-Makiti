import HeroSection from '@/src/components/shop/HeroSection';
import AdvantagesSection from '@/src/components/shop/AdvantagesSection';
import CategoriesSection from '@/src/components/shop/CategoriesSection';
import PopularProducts from '@/src/components/shop/PopularProducts';
import PromoBanner from '@/src/components/shop/PromoBanner';
import TestimonialsSection from '@/src/components/shop/TestimonialsSection';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getFeaturedProducts } from '@/src/lib/services/products.service';
import { getCategories } from '@/src/lib/services/categories.service';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [products, categories] = await Promise.all([
    getFeaturedProducts(8, supabase).catch(() => []),
    getCategories(supabase).catch(() => []),
  ]);

  return (
    <>
      <HeroSection />
      <AdvantagesSection />
      <CategoriesSection categories={categories} />
      <PopularProducts products={products} />
      <PromoBanner />
      <TestimonialsSection />
    </>
  );
}
