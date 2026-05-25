import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="bg-rouge py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-2xl font-bold text-white md:text-4xl">
          🎉 PROMO SPÉCIALE — Jusqu&apos;à -30% sur les Smartphones
        </p>
        <p className="mt-3 text-white/80 text-base">
          Offre valable jusqu&apos;au 31 janvier 2025
        </p>
        <Link
          href="/boutique"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 font-semibold text-rouge shadow-md hover:bg-white/90 transition-colors"
        >
          Profiter de l&apos;offre
        </Link>
      </div>
    </section>
  );
}
