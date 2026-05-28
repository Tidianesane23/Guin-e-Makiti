'use client';

import { useState, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faCheckCircle, faUser } from '@/src/lib/icons';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm flex flex-col gap-5">
      <h2 className="text-base font-bold text-noir border-b border-gray-100 pb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#C8860A] focus:ring-1 focus:ring-[#C8860A]';

function Feedback({ msg, isError }: { msg: string; isError: boolean }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
      style={{
        background: isError ? 'rgba(192,57,43,0.08)' : 'rgba(0,153,68,0.08)',
        border:     `1px solid ${isError ? 'rgba(192,57,43,0.2)' : 'rgba(0,153,68,0.2)'}`,
        color:      isError ? '#C0392B' : '#009944',
      }}
    >
      {!isError && <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 14 }} />}
      {msg}
    </p>
  );
}

export default function ParametresPage() {
  const { user } = useAuth();

  // — Mot de passe
  const [pwd,        setPwd]        = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg,     setPwdMsg]     = useState('');
  const [pwdErr,     setPwdErr]     = useState(false);

  // — Email
  const [email,        setEmail]        = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg,     setEmailMsg]     = useState('');
  const [emailErr,     setEmailErr]     = useState(false);

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pwd !== pwdConfirm) {
      setPwdErr(true); setPwdMsg('Les mots de passe ne correspondent pas.'); return;
    }
    if (pwd.length < 8) {
      setPwdErr(true); setPwdMsg('Minimum 8 caractères.'); return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setPwdLoading(false);
    if (error) {
      setPwdErr(true); setPwdMsg('Erreur : ' + error.message);
    } else {
      setPwdErr(false); setPwdMsg('Mot de passe mis à jour avec succès !');
      setPwd(''); setPwdConfirm('');
    }
  };

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setEmailErr(true); setEmailMsg('Adresse e-mail invalide.'); return;
    }
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/parametres` },
    );
    setEmailLoading(false);
    if (error) {
      setEmailErr(true); setEmailMsg('Erreur : ' + error.message);
    } else {
      setEmailErr(false);
      setEmailMsg(`Email de confirmation envoyé à ${email}. Vérifiez votre boîte mail.`);
      setEmail('');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-noir">Paramètres du compte</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connecté en tant que <span className="font-semibold text-noir">{user?.email}</span>
        </p>
      </div>

      {/* Modifier le mot de passe */}
      <Section title="Modifier le mot de passe">
        <form onSubmit={handlePassword} className="flex flex-col gap-4">
          <Field label="Nouveau mot de passe">
            <div className="relative">
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Minimum 8 caractères"
                className={inputCls}
              />
              <FontAwesomeIcon icon={faLock} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 13, color: '#D1D5DB' }} />
            </div>
          </Field>
          <Field label="Confirmer le mot de passe">
            <input
              type="password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              placeholder="Répétez le mot de passe"
              className={inputCls}
            />
          </Field>
          <Feedback msg={pwdMsg} isError={pwdErr} />
          <button
            type="submit"
            disabled={pwdLoading}
            className="self-start flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#C8860A' }}
          >
            {pwdLoading
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 14 }} />
              : 'Mettre à jour'
            }
          </button>
        </form>
      </Section>

      {/* Modifier l'adresse e-mail */}
      <Section title="Modifier l'adresse e-mail">
        <form onSubmit={handleEmail} className="flex flex-col gap-4">
          <Field label="Nouvelle adresse e-mail">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nouvelle@adresse.com"
                className={inputCls}
              />
              <FontAwesomeIcon icon={faUser} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 13, color: '#D1D5DB' }} />
            </div>
          </Field>
          <p className="text-xs text-gray-400">
            Un e-mail de confirmation sera envoyé à la nouvelle adresse avant que le changement soit effectif.
          </p>
          <Feedback msg={emailMsg} isError={emailErr} />
          <button
            type="submit"
            disabled={emailLoading}
            className="self-start flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#C8860A' }}
          >
            {emailLoading
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 14 }} />
              : 'Envoyer la confirmation'
            }
          </button>
        </form>
      </Section>
    </div>
  );
}
