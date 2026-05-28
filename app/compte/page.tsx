'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faPhone, faMapMarkerAlt, faEdit, faCheck, faLock,
  faShoppingBag, faSignOutAlt, faTruck, faSpinner,
  faCheckCircle, faExclamationCircle, faChevronRight, faChevronDown,
} from '@/src/lib/icons';
import { useAuth } from '@/src/hooks/useAuth';

function InfoRow({ icon, label, value }: { icon: typeof faUser; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(200,134,10,0.07)' }}>
      <div className="flex items-center justify-center rounded-lg shrink-0 mt-0.5"
        style={{ width: 32, height: 32, background: 'rgba(200,134,10,0.09)', color: '#C8860A' }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: 13 }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-medium text-[#2C1A1A] mt-0.5">{value || <span className="text-gray-300 italic">Non renseigné</span>}</p>
      </div>
    </div>
  );
}

export default function ComptePage() {
  const { user, loading, signOut, updateProfile, changePassword, changeEmail } = useAuth();
  const router = useRouter();

  const [editing,  setEditing]  = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [errMsg,   setErrMsg]   = useState('');

  // — Sécurité : mot de passe
  const [pwdOpen,    setPwdOpen]    = useState(false);
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdBusy,    setPwdBusy]    = useState(false);
  const [pwdMsg,     setPwdMsg]     = useState('');
  const [pwdErr,     setPwdErr]     = useState(false);

  // — Sécurité : email
  const [emailOpen,  setEmailOpen]  = useState(false);
  const [newEmail,   setNewEmail]   = useState('');
  const [emailBusy,  setEmailBusy]  = useState(false);
  const [emailMsg,   setEmailMsg]   = useState('');
  const [emailErr,   setEmailErr]   = useState(false);

  const meta = user?.user_metadata ?? {};

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [gender,    setGender]    = useState('');
  const [phone,     setPhone]     = useState('');
  const [address,   setAddress]   = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/compte/connexion');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFirstName(meta.first_name ?? '');
      setLastName(meta.last_name  ?? '');
      setGender(meta.gender       ?? '');
      setPhone(meta.phone         ?? '');
      setAddress(meta.address     ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#C8860A] border-t-transparent" />
      </div>
    );
  }

  const handlePwd = async (e: FormEvent) => {
    e.preventDefault();
    setPwdMsg(''); setPwdErr(false);
    if (newPwd !== confirmPwd) { setPwdErr(true); setPwdMsg('Les mots de passe ne correspondent pas.'); return; }
    if (newPwd.length < 8)     { setPwdErr(true); setPwdMsg('Minimum 8 caractères.'); return; }
    setPwdBusy(true);
    const error = await changePassword(newPwd);
    setPwdBusy(false);
    if (error) { setPwdErr(true); setPwdMsg('Erreur : ' + error.message); }
    else { setPwdErr(false); setPwdMsg('Mot de passe mis à jour !'); setNewPwd(''); setConfirmPwd(''); setPwdOpen(false); }
  };

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    setEmailMsg(''); setEmailErr(false);
    if (!newEmail.includes('@')) { setEmailErr(true); setEmailMsg('Adresse e-mail invalide.'); return; }
    setEmailBusy(true);
    const error = await changeEmail(newEmail);
    setEmailBusy(false);
    if (error) { setEmailErr(true); setEmailMsg('Erreur : ' + error.message); }
    else { setEmailErr(false); setEmailMsg(`Confirmation envoyée à ${newEmail}. Vérifiez votre boîte mail.`); setNewEmail(''); setEmailOpen(false); }
  };

  const displayName = [meta.first_name, meta.last_name].filter(Boolean).join(' ') || user.email;
  const initials    = meta.first_name
    ? (meta.first_name[0] + (meta.last_name?.[0] ?? '')).toUpperCase()
    : (user.email?.slice(0, 2).toUpperCase() ?? '??');

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    setBusy(true);
    const error = await updateProfile({
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      gender,
      phone:      phone.trim(),
      address:    address.trim(),
    });
    setBusy(false);
    if (error) {
      setErrMsg('Erreur lors de la sauvegarde.');
    } else {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ background: 'linear-gradient(135deg,#FFF8F0 0%,#FFFAF8 60%,#FFF0E0 100%)' }}
    >
      <div className="mx-auto max-w-lg flex flex-col gap-5">

        {/* Avatar + nom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="rounded-2xl bg-white shadow-sm p-6 flex items-center gap-4"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}
        >
          <div
            className="flex items-center justify-center rounded-full text-white font-bold text-xl shrink-0"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#C8860A,#E6A020)', boxShadow: '0 4px 14px rgba(200,134,10,0.3)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-[#2C1A1A] truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium mt-1" style={{ color: '#009944' }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 11 }} />
                Profil mis à jour
              </span>
            )}
          </div>
        </motion.div>

        {/* Infos profil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.07 }}
          className="rounded-2xl bg-white shadow-sm overflow-hidden"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mes informations</p>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
                style={{ background: 'rgba(200,134,10,0.09)', color: '#C8860A' }}
              >
                <FontAwesomeIcon icon={faEdit} style={{ fontSize: 11 }} />
                Modifier
              </button>
            )}
          </div>

          {!editing ? (
            <div className="px-6 pb-4">
              <InfoRow icon={faUser}         label="Prénom"    value={meta.first_name} />
              <InfoRow icon={faUser}         label="Nom"       value={meta.last_name} />
              <InfoRow icon={faUser}         label="Sexe"      value={GENDER_LABEL[meta.gender ?? '']} />
              <InfoRow icon={faPhone}        label="Téléphone" value={meta.phone} />
              <InfoRow icon={faMapMarkerAlt} label="Adresse"   value={meta.address} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="px-6 pb-5 flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <EditField label="Prénom"     value={firstName} onChange={setFirstName} placeholder="Mamadou" />
                <EditField label="Nom"        value={lastName}  onChange={setLastName}  placeholder="Diallo"   />
              </div>
              <GenderPickerEdit value={gender} onChange={setGender} />
              <EditField label="Téléphone"  value={phone}     onChange={setPhone}     placeholder="620 00 00 00" type="tel" />
              <EditField label="Adresse / Quartier" value={address} onChange={setAddress} placeholder="ex: Kaloum, Conakry" />

              {errMsg && (
                <p className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
                  style={{ background: 'rgba(192,57,43,0.07)', color: '#C0392B', border: '1px solid rgba(192,57,43,0.15)' }}>
                  <FontAwesomeIcon icon={faExclamationCircle} style={{ fontSize: 12 }} />
                  {errMsg}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit" disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#C8860A,#E6A020)' }}
                >
                  {busy
                    ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 14 }} />
                    : <><FontAwesomeIcon icon={faCheck} style={{ fontSize: 13 }} /> Enregistrer</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setErrMsg(''); }}
                  className="px-5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: 'rgba(44,26,26,0.06)', color: '#7A4A3A' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Liens rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.13 }}
          className="rounded-2xl bg-white shadow-sm overflow-hidden"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}
        >
          <p className="px-6 pt-5 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</p>
          <QuickLink icon={faTruck}       label="Suivre mes commandes"  desc="Voir le statut de vos commandes"   href="/suivi-commande" />
          <QuickLink icon={faShoppingBag} label="Parcourir la boutique" desc="Découvrir nos produits disponibles" href="/boutique" />
        </motion.div>

        {/* Sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }}
          className="rounded-2xl bg-white shadow-sm overflow-hidden"
          style={{ border: '1px solid rgba(200,134,10,0.12)' }}
        >
          <p className="px-6 pt-5 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Sécurité</p>

          {/* Changer le mot de passe */}
          <div style={{ borderTop: '1px solid rgba(200,134,10,0.08)' }}>
            <button
              type="button"
              onClick={() => { setPwdOpen(v => !v); setPwdMsg(''); }}
              className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-[rgba(200,134,10,0.03)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl"
                  style={{ width: 36, height: 36, background: 'rgba(200,134,10,0.1)', color: '#C8860A' }}>
                  <FontAwesomeIcon icon={faLock} style={{ fontSize: 14 }} />
                </div>
                <span className="text-sm font-semibold text-[#2C1A1A]">Changer le mot de passe</span>
              </div>
              <FontAwesomeIcon icon={faChevronDown}
                style={{ fontSize: 12, color: '#C8860A', transition: 'transform 0.2s', transform: pwdOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {pwdOpen && (
              <form onSubmit={handlePwd} className="px-6 pb-5 flex flex-col gap-3">
                <EditField label="Nouveau mot de passe"   value={newPwd}     onChange={setNewPwd}     placeholder="Min. 8 caractères" type="password" />
                <EditField label="Confirmer"              value={confirmPwd} onChange={setConfirmPwd} placeholder="Répéter le mot de passe" type="password" />
                {pwdMsg && <SecurityFeedback msg={pwdMsg} isError={pwdErr} />}
                <button type="submit" disabled={pwdBusy}
                  className="self-start flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#C8860A,#E6A020)' }}>
                  {pwdBusy ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 13 }} /> : 'Mettre à jour'}
                </button>
              </form>
            )}
          </div>

          {/* Changer l'adresse e-mail */}
          <div style={{ borderTop: '1px solid rgba(200,134,10,0.08)' }}>
            <button
              type="button"
              onClick={() => { setEmailOpen(v => !v); setEmailMsg(''); }}
              className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-[rgba(200,134,10,0.03)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl"
                  style={{ width: 36, height: 36, background: 'rgba(200,134,10,0.1)', color: '#C8860A' }}>
                  <FontAwesomeIcon icon={faUser} style={{ fontSize: 14 }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#2C1A1A]">Changer l'adresse e-mail</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faChevronDown}
                style={{ fontSize: 12, color: '#C8860A', transition: 'transform 0.2s', transform: emailOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {emailOpen && (
              <form onSubmit={handleEmail} className="px-6 pb-5 flex flex-col gap-3">
                <EditField label="Nouvelle adresse e-mail" value={newEmail} onChange={setNewEmail} placeholder="nouvelle@adresse.com" type="email" />
                <p className="text-xs text-gray-400">Un e-mail de confirmation sera envoyé à la nouvelle adresse.</p>
                {emailMsg && <SecurityFeedback msg={emailMsg} isError={emailErr} />}
                <button type="submit" disabled={emailBusy}
                  className="self-start flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#C8860A,#E6A020)' }}>
                  {emailBusy ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 13 }} /> : 'Envoyer la confirmation'}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Déconnexion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }}
        >
          <button
            onClick={async () => { await signOut(); router.push('/'); }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-colors"
            style={{ background: 'rgba(192,57,43,0.07)', color: '#C0392B', border: '1px solid rgba(192,57,43,0.14)' }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: 15 }} />
            Se déconnecter
          </button>
        </motion.div>

      </div>
    </div>
  );
}

const GENDER_LABEL: Record<string, string> = {
  homme:       'Homme',
  femme:       'Femme',
  non_precise: 'Je préfère ne pas préciser',
};

const GENDERS = [
  { value: 'homme',       label: 'Homme' },
  { value: 'femme',       label: 'Femme' },
  { value: 'non_precise', label: 'Je préfère ne pas préciser' },
];

function GenderPickerEdit({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sexe</label>
      <div className="flex gap-2 flex-wrap">
        {GENDERS.map(({ value: v, label }) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(active ? '' : v)}
              className="flex-1 min-w-0 rounded-xl py-2 px-2 text-xs font-semibold transition-all"
              style={{
                background: active ? 'rgba(200,134,10,0.12)' : '#FFFAF8',
                border:     `1.5px solid ${active ? '#C8860A' : 'rgba(200,134,10,0.25)'}`,
                color:      active ? '#C8860A' : '#7A4A3A',
                boxShadow:  active ? '0 0 0 3px rgba(200,134,10,0.08)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
        style={{ borderColor: 'rgba(200,134,10,0.25)', background: '#FFFAF8' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#C8860A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,134,10,0.1)'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,134,10,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function SecurityFeedback({ msg, isError }: { msg: string; isError: boolean }) {
  return (
    <p className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium"
      style={{
        background: isError ? 'rgba(192,57,43,0.07)' : 'rgba(0,153,68,0.07)',
        border:     `1px solid ${isError ? 'rgba(192,57,43,0.15)' : 'rgba(0,153,68,0.15)'}`,
        color:      isError ? '#C0392B' : '#007A38',
      }}>
      <FontAwesomeIcon icon={isError ? faExclamationCircle : faCheckCircle} style={{ fontSize: 12, marginTop: 1, flexShrink: 0 }} />
      {msg}
    </p>
  );
}

function QuickLink({ icon, label, desc, href }: { icon: typeof faUser; label: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[rgba(200,134,10,0.04)] group"
      style={{ borderTop: '1px solid rgba(200,134,10,0.08)' }}
    >
      <div className="flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 40, height: 40, background: 'rgba(200,134,10,0.1)', color: '#C8860A' }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2C1A1A]">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <FontAwesomeIcon icon={faChevronRight}
        className="opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ fontSize: 12, color: '#C8860A' }} />
    </Link>
  );
}
