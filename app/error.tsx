'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/src/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle size={36} className="text-rouge" />
      </div>

      <div>
        <h1 className="text-xl font-bold text-noir">Une erreur est survenue</h1>
        <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" onClick={reset}>
          Réessayer
        </Button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}
