'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/src/hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faShieldAlt } from '@/src/lib/icons';

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
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: '#0D0606' }}
    >
      {/* Blobs décoratifs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full"
        style={{ background: 'rgba(200,134,10,0.1)', filter: 'blur(90px)' }} />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[350px] w-[350px] rounded-full"
        style={{ background: 'rgba(200,134,10,0.07)', filter: 'blur(70px)' }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full"
        style={{ background: 'rgba(44,10,10,0.4)', filter: 'blur(60px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-3xl px-8 py-10"
          style={{
            background:   'rgba(255,255,255,0.04)',
            border:       '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Icône + titre */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(200,134,10,0.15)', border: '1px solid rgba(200,134,10,0.3)' }}
            >
              <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: 24, color: '#C8860A' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Guinée <span style={{ color: '#C8860A' }}>Makiti</span>
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Espace Administrateur
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@guinee-makiti.shop"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                style={{
                  background:   'rgba(255,255,255,0.07)',
                  border:       '1px solid rgba(255,255,255,0.1)',
                  caretColor:   '#C8860A',
                }}
                onFocus={(e)  => (e.currentTarget.style.borderColor = 'rgba(200,134,10,0.6)')}
                onBlur={(e)   => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white outline-none transition-all"
                  style={{
                    background:   'rgba(255,255,255,0.07)',
                    border:       '1px solid rgba(255,255,255,0.1)',
                    caretColor:   '#C8860A',
                  }}
                  onFocus={(e)  => (e.currentTarget.style.borderColor = 'rgba(200,134,10,0.6)')}
                  onBlur={(e)   => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <FontAwesomeIcon
                  icon={faLock}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-4 py-2.5 text-sm"
                style={{
                  background: 'rgba(192,57,43,0.15)',
                  border:     '1px solid rgba(192,57,43,0.3)',
                  color:      '#FF6B6B',
                }}
              >
                {error}
              </motion.p>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C8860A 0%, #A06800 100%)' }}
            >
              {loading
                ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 18 }} />
                : 'Accéder au panel'
              }
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Guinée Makiti Admin · Accès restreint
        </p>
      </motion.div>
    </div>
  );
}
