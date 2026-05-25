import Image from 'next/image';
import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="relative overflow-hidden bg-rouge py-14 md:py-20">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image
          src="/autreImage1.jpeg"
          alt=""
          fill
          className="object-cover opacity-15"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-3xl font-extrabold text-white uppercase md:text-5xl">
          🎉 PROMO SPÉCIALE
        </p>
        <p className="mt-2 text-xl font-bold text-white/90 uppercase md:text-2xl">
          Jusqu&apos;à -30% sur les Smartphones
        </p>
        <p className="mt-3 text-white/70 text-base">
          Offre à durée limitée — commandez maintenant
        </p>
        <Link
          href="/boutique"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-jaune px-10 py-3.5 font-bold text-noir text-lg shadow-lg hover:opacity-90 transition-opacity"
        >
          Profiter de l&apos;offre
        </Link>
      </div>
    </section>
  );
}
