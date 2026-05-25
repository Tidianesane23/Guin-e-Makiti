'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import Button from '@/src/components/ui/Button';

export default function AdminLoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { signIn } = useAuth();
  const router     = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await signIn(email, password);
    if (err) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else {
      router.replace('/admin/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold">
            <span className="text-noir">Guinée </span>
            <span className="text-rouge">Makiti</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">Espace Administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-noir">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-rouge focus:ring-1 focus:ring-rouge"
              placeholder="admin@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-noir">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-rouge focus:ring-1 focus:ring-rouge"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-rouge">{error}</p>
          )}

          <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-2">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
