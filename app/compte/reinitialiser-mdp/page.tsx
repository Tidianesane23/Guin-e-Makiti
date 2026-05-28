'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faCheckCircle, faExclamationCircle } from '@/src/lib/icons';
import { supabase } from '@/src/lib/supabase';
import LogoText from '@/src/components/ui/LogoText';

export default function ReinitialiserMdpPage() {
  const router = useRouter();

  const [ready,   setReady]   = useState(false);   // session recovery détectée
  const [pwd,     setPwd]     = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy,    setBusy]    = useState(false);
  const [msg,     setMsg]     = useState('');
  const [isError, setIsError] = useState(false);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    // Supabase échange le code de récupération automatiquement via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    // Si déjà dans une session de récupération (page rechargée)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(''); setIsError(false);
    if (pwd !== confirm) { setIsError(true); setMsg('Les mots de passe ne correspondent pas.'); return; }
    if (pwd.length < 8)  { setIsError(true); setMsg('Minimum 8 caractères.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) {
      setIsError(true); setMsg('Erreur : ' + error.message);
    } else {
      setDone(true);
      const { data } = await supabase.auth.getUser();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'guineemakiti224@gmail.com';
      const dest = data.user?.email === adminEmail ? '/admin/dashboard' : '/compte';
      setTimeout(() => router.replace(dest), 2500);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg,#FFF8F0 0%,#FFFAF8 60%,#FFF0E0 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl bg-white shadow-xl overflow-hidden"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center"
            style={{ background: 'linear-gradient(135deg,#2C1A1A,#3D2300)' }}>
            <div className="flex justify-center mb-3">
              <div className="flex items-center justify-center rounded-xl bg-white overflow-hidden"
                style={{ width: 48, height: 48, boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                <img src="/logo.jpeg" alt="Guinée Makiti" width={48} height={48}
                  style={{ objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }} />
              </div>
            </div>
            <LogoText size="lg" />
            <p className="mt-1.5 text-xs tracking-[0.18em] uppercase font-medium"
              style={{ color: 'rgba(200,134,10,0.7)' }}>
              Nouveau mot de passe
            </p>
          </div>

          <div className="px-8 py-7">
            {done ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 56, height: 56, background: 'rgba(0,153,68,0.1)' }}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 28, color: '#009944' }} />
                </div>
                <p className="text-sm font-semibold text-[#2C1A1A]">Mot de passe mis à jour !</p>
                <p className="text-xs text-gray-400">Redirection vers votre compte…</p>
              </div>
            ) : !ready ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#C8860A] border-t-transparent" />
                <p className="text-sm text-gray-500">Vérification du lien…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-sm text-gray-500">Choisissez un nouveau mot de passe pour votre compte.</p>

                {/* Nouveau mot de passe */}
                <div className="relative">
                  <FontAwesomeIcon icon={faLock}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ fontSize: 13, color: '#C8860A', width: 13 }} />
                  <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
                    placeholder="Nouveau mot de passe (min. 8 caract.)" required
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
                    style={{ border: '1.5px solid rgba(200,134,10,0.25)', background: '#FFFAF8' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#C8860A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,134,10,0.1)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,134,10,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Confirmation */}
                <div className="relative">
                  <FontAwesomeIcon icon={faLock}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ fontSize: 13, color: '#C8860A', width: 13 }} />
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirmer le mot de passe" required
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
                    style={{ border: '1.5px solid rgba(200,134,10,0.25)', background: '#FFFAF8' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#C8860A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,134,10,0.1)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,134,10,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                {msg && (
                  <p className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                      background: isError ? 'rgba(192,57,43,0.07)' : 'rgba(0,153,68,0.07)',
                      border:     `1px solid ${isError ? 'rgba(192,57,43,0.18)' : 'rgba(0,153,68,0.18)'}`,
                      color:      isError ? '#C0392B' : '#007A38',
                    }}>
                    <FontAwesomeIcon icon={isError ? faExclamationCircle : faCheckCircle}
                      style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }} />
                    {msg}
                  </p>
                )}

                <button type="submit" disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#C8860A,#E6A020)' }}>
                  {busy ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 16 }} /> : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
