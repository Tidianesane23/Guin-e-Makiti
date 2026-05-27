'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@/src/lib/icons';

const ADMIN_VISITOR_KEY = 'adminViewingAsUser';

export default function AdminFloatingBar() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setVisible(localStorage.getItem(ADMIN_VISITOR_KEY) === '1');
  }, []);

  if (!visible) return null;

  function backToAdmin() {
    localStorage.removeItem(ADMIN_VISITOR_KEY);
    router.push('/admin/dashboard');
  }

  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3 shadow-2xl"
      style={{
        background:   '#1C0A0A',
        border:       '1px solid rgba(200,134,10,0.45)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <FontAwesomeIcon icon={faEye} style={{ fontSize: 15, color: '#C8860A' }} />
      <span className="text-sm font-semibold text-white">Mode visiteur</span>
      <button
        onClick={backToAdmin}
        className="rounded-xl px-4 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80"
        style={{ background: '#C8860A' }}
      >
        Retour admin
      </button>
    </div>
  );
}
