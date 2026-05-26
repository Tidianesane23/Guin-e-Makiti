import HeroSection from '@/src/components/shop/HeroSection';
import HowItWorksSection from '@/src/components/shop/HowItWorksSection';
import CategoriesSection from '@/src/components/shop/CategoriesSection';
import PopularProducts from '@/src/components/shop/PopularProducts';
import PromoBanner from '@/src/components/shop/PromoBanner';
import TestimonialsSection from '@/src/components/shop/TestimonialsSection';
import FlashSaleSection from '@/src/components/shop/FlashSaleSection';
import AboutSection from '@/src/components/shop/AboutSection';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { getFeaturedProducts } from '@/src/lib/services/products.service';
import { getCategories } from '@/src/lib/services/categories.service';
import { getPublishedReviews } from '@/src/lib/services/reviews.service';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [products, categories, reviews] = await Promise.all([
    getFeaturedProducts(8, supabase).catch(() => []),
    getCategories(supabase).catch(() => []),
    getPublishedReviews(6, supabase).catch(() => []),
  ]);

  return (
    <>
      <HeroSection />

      <HowItWorksSection />

      <AboutSection />

      <PromoBanner
        badge="OFFRE LIMITÉE"
        title="Jusqu'à -30% sur"
        titleHighlight="nos Smartphones"
        subtitle="Offre valable cette semaine uniquement"
        advantages={[
          'Livraison gratuite incluse',
          'Paiement à la livraison',
          'Garantie authenticité',
        ]}
        image="/autreImage4.jpeg"
        buttonText="Profiter de l'offre →"
        buttonLink="/boutique?categorie=smartphones"
      />

      <FlashSaleSection products={products} />

      <CategoriesSection categories={categories} />

      <PopularProducts products={products} />

      <PromoBanner
        badge="NOUVEAUTÉS"
        title="Audio premium à"
        titleHighlight="prix imbattables"
        subtitle="Casques, écouteurs, enceintes — stock limité"
        advantages={[
          'Livraison J+1 à Conakry',
          'Garantie 6 mois',
          'Meilleur rapport qualité-prix',
        ]}
        image="/autreImage1.jpeg"
        buttonText="Découvrir →"
        buttonLink="/boutique?categorie=audio"
      />

      <TestimonialsSection reviews={reviews} />

      <PromoBanner
        badge="COLLECTION 2025"
        title="Mode & Beauté"
        titleHighlight="tendances"
        subtitle="Les dernières tendances disponibles en Guinée"
        advantages={[
          'Nouveaux arrivages chaque semaine',
          'Tailles variées disponibles',
          'Paiement à la livraison',
        ]}
        image="/autreImage2.jpeg"
        buttonText="Explorer →"
        buttonLink="/boutique?categorie=mode"
      />
    </>
  );
}
