'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faPhone, faMapMarkerAlt, faEdit, faCheck,
  faShoppingBag, faSignOutAlt, faTruck, faSpinner,
  faCheckCircle, faExclamationCircle, faChevronRight,
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
  const { user, loading, signOut, updateProfile } = useAuth();
  const router = useRouter();

  const [editing,  setEditing]  = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [errMsg,   setErrMsg]   = useState('');

  const meta = user?.user_metadata ?? {};

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [address,   setAddress]   = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/compte/connexion');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFirstName(meta.first_name ?? '');
      setLastName(meta.last_name  ?? '');
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
              <InfoRow icon={faPhone}        label="Téléphone" value={meta.phone} />
              <InfoRow icon={faMapMarkerAlt} label="Adresse"   value={meta.address} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="px-6 pb-5 flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <EditField label="Prénom"     value={firstName} onChange={setFirstName} placeholder="Mamadou" />
                <EditField label="Nom"        value={lastName}  onChange={setLastName}  placeholder="Diallo"   />
              </div>
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
