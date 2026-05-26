import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@/src/lib/icons';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FontAwesomeIcon icon={faSearch} style={{ fontSize: 36 }} className="text-gray-400" />
      </div>

      <div>
        <p className="text-7xl font-extrabold" style={{ color: '#C8860A' }}>404</p>
        <h1 className="mt-2 text-xl font-bold text-noir">Page introuvable</h1>
        <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-rouge px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/boutique"
          className="inline-flex items-center justify-center rounded-xl border-2 border-rouge px-5 py-2.5 text-sm font-semibold text-rouge transition-all hover:bg-rouge hover:text-white"
        >
          Voir la boutique
        </Link>
      </div>
    </div>
  );
}
