'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faLock, faPhone, faMapMarkerAlt,
  faSpinner, faCheckCircle, faExclamationCircle, faShoppingBag,
} from '@/src/lib/icons';
import { useAuth } from '@/src/hooks/useAuth';
import LogoText from '@/src/components/ui/LogoText';

type Tab = 'login' | 'signup';

const inputBase = {
  border: '1.5px solid rgba(200,134,10,0.25)',
  background: '#FFFAF8',
} as const;

function Field({
  icon, type = 'text', value, onChange, placeholder, required = false,
}: {
  icon: typeof faUser;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <FontAwesomeIcon
        icon={icon}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
        style={{ fontSize: 13, color: '#C8860A', width: 13 }}
      />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
        style={inputBase}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#C8860A';
          e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(200,134,10,0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(200,134,10,0.25)';
          e.currentTarget.style.boxShadow   = 'none';
        }}
      />
    </div>
  );
}

export default function CompteConnexionPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();

  const [tab,      setTab]      = useState<Tab>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [address,   setAddress]   = useState('');
  const [busy,     setBusy]     = useState(false);
  const [msg,      setMsg]      = useState('');
  const [isError,  setIsError]  = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/compte');
  }, [user, loading, router]);

  const reset = () => { setMsg(''); setIsError(false); };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);
    const error = await signIn(email, password);
    setBusy(false);
    if (error) { setIsError(true); setMsg('Email ou mot de passe incorrect.'); }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    if (!firstName.trim()) {
      setIsError(true); setMsg('Veuillez entrer votre prénom.'); return;
    }
    if (password !== confirm) {
      setIsError(true); setMsg('Les mots de passe ne correspondent pas.'); return;
    }
    if (password.length < 8) {
      setIsError(true); setMsg('Minimum 8 caractères pour le mot de passe.'); return;
    }
    setBusy(true);
    const error = await signUp(email, password, {
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      phone:      phone.trim(),
      address:    address.trim(),
    });
    setBusy(false);
    if (error) {
      setIsError(true); setMsg('Erreur : ' + error.message);
    } else {
      setIsError(false);
      setMsg('Compte créé avec succès ! Vous êtes maintenant connecté.');
    }
  };

  if (loading) return null;

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg,#FFF8F0 0%,#FFFAF8 60%,#FFF0E0 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-2xl bg-white shadow-xl overflow-hidden"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}
        >
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6 text-center"
            style={{ background: 'linear-gradient(135deg,#2C1A1A,#3D2300)' }}
          >
            <div className="flex justify-center mb-3">
              <div
                className="flex items-center justify-center rounded-xl bg-white overflow-hidden"
                style={{ width: 48, height: 48, boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
              >
                <img src="/logo.jpeg" alt="Guinée Makiti" width={48} height={48}
                  style={{ objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }} />
              </div>
            </div>
            <LogoText size="lg" />
            <p className="mt-1.5 text-xs tracking-[0.18em] uppercase font-medium"
              style={{ color: 'rgba(200,134,10,0.7)' }}>
              Mon compte
            </p>
          </div>

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(200,134,10,0.12)' }}>
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className="flex-1 py-3.5 text-sm font-semibold transition-colors relative"
                style={{ color: tab === t ? '#C8860A' : '#7A4A3A' }}
              >
                {t === 'login' ? 'Connexion' : 'Créer un compte'}
                {tab === t && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: '#C8860A' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="px-8 py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'login' ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === 'login' ? 12 : -12 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'login' ? (
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Field icon={faUser}  type="email"    value={email}    onChange={setEmail}    placeholder="Votre adresse e-mail" required />
                    <Field icon={faLock}  type="password" value={password} onChange={setPassword} placeholder="Mot de passe"         required />

                    {msg && <Feedback msg={msg} isError={isError} />}

                    <button
                      type="submit" disabled={busy}
                      className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#C8860A,#E6A020)' }}
                    >
                      {busy ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 16 }} /> : 'Se connecter'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="flex flex-col gap-4">

                    {/* Section : Identité */}
                    <SectionLabel>Identité</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <HalfField value={firstName} onChange={setFirstName} placeholder="Prénom" required />
                      <HalfField value={lastName}  onChange={setLastName}  placeholder="Nom de famille" />
                    </div>

                    {/* Section : Contact */}
                    <SectionLabel>Contact &amp; Adresse</SectionLabel>
                    <Field icon={faPhone}        value={phone}   onChange={setPhone}   placeholder="Téléphone (ex: 620 00 00 00)" />
                    <Field icon={faMapMarkerAlt} value={address} onChange={setAddress} placeholder="Quartier / Adresse à Conakry" />

                    {/* Section : Compte */}
                    <SectionLabel>Identifiants du compte</SectionLabel>
                    <Field icon={faUser} type="email"    value={email}    onChange={setEmail}    placeholder="Adresse e-mail"               required />
                    <Field icon={faLock} type="password" value={password} onChange={setPassword} placeholder="Mot de passe (min. 8 caract.)" required />
                    <Field icon={faLock} type="password" value={confirm}  onChange={setConfirm}  placeholder="Confirmer le mot de passe"     required />

                    {msg && <Feedback msg={msg} isError={isError} />}

                    <button
                      type="submit" disabled={busy}
                      className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#C8860A,#E6A020)' }}
                    >
                      {busy ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 16 }} /> : 'Créer mon compte'}
                    </button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 text-center">
              <Link
                href="/boutique"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: '#7A4A3A' }}
              >
                <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: 12 }} />
                Continuer sans compte
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C8860A' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(200,134,10,0.2)' }} />
    </div>
  );
}

function HalfField({ value, onChange, placeholder, required = false }: {
  value: string; onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl py-3 px-4 text-sm outline-none transition-all"
      style={inputBase}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#C8860A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,134,10,0.1)'; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,134,10,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

function Feedback({ msg, isError }: { msg: string; isError: boolean }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium"
      style={{
        background: isError ? 'rgba(192,57,43,0.07)' : 'rgba(0,153,68,0.07)',
        border:     `1px solid ${isError ? 'rgba(192,57,43,0.18)' : 'rgba(0,153,68,0.18)'}`,
        color:      isError ? '#C0392B' : '#007A38',
      }}
    >
      <FontAwesomeIcon
        icon={isError ? faExclamationCircle : faCheckCircle}
        style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}
      />
      {msg}
    </motion.p>
  );
}
