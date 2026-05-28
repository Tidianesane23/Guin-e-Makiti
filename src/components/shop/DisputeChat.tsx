'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faSpinner, faDownload, faCheckCircle } from '@/src/lib/icons';
import {
  getDisputeMessages,
  sendDisputeMessage,
  uploadDisputeFile,
  type DisputeMessage,
} from '@/src/lib/services/dispute.service';
import { markDisputeResolved, confirmOrRejectResolution } from '@/src/lib/services/orders.service';

interface DisputeChatProps {
  orderId: string;
  sender: 'client' | 'admin';
  initialDisputeReason?: string;
  disputeStatus?: 'open' | 'admin_resolved' | 'client_confirmed' | null;
  onStatusChange?: (newStatus: 'open' | 'admin_resolved' | 'client_confirmed') => void;
  customerEmail?: string;
  customerName?: string;
  orderRef?: string;
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
}

export default function DisputeChat({
  orderId,
  sender,
  initialDisputeReason,
  disputeStatus,
  onStatusChange,
  customerEmail,
  customerName,
  orderRef,
}: DisputeChatProps) {
  const [messages,       setMessages]       = useState<DisputeMessage[]>([]);
  const [text,           setText]           = useState('');
  const [sending,        setSending]        = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [loaded,         setLoaded]         = useState(false);
  const [resolving,      setResolving]      = useState(false);
  const [confirming,     setConfirming]     = useState(false);
  const fileRef   = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isClosed = disputeStatus === 'client_confirmed';
  const ref = orderRef ?? orderId.slice(0, 8).toUpperCase();

  const notifyOtherParty = (content?: string, fileName?: string) => {
    fetch('/api/notify-dispute-message', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, orderRef: ref, content, fileName, customerEmail, customerName }),
    }).catch(() => {});
  };

  const load = async () => {
    try {
      const msgs = await getDisputeMessages(orderId);
      setMessages(msgs);
      setLoaded(true);
    } catch { /* keep previous */ }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isClosed) return;
    setSending(true);
    try {
      const msg = await sendDisputeMessage(orderId, sender, text.trim());
      setMessages((prev) => [...prev, msg]);
      notifyOtherParty(text.trim());
      setText('');
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isClosed) return;
    setUploading(true);
    try {
      const url = await uploadDisputeFile(file, orderId);
      const msg = await sendDisputeMessage(orderId, sender, undefined, url, file.name);
      setMessages((prev) => [...prev, msg]);
      notifyOtherParty(undefined, file.name);
    } catch { /* ignore */ }
    setUploading(false);
    e.target.value = '';
  };

  const handleAdminResolve = async () => {
    setResolving(true);
    try {
      await markDisputeResolved(orderId);
      onStatusChange?.('admin_resolved');
    } catch { /* ignore */ }
    setResolving(false);
  };

  const handleClientResponse = async (confirmed: boolean) => {
    setConfirming(true);
    try {
      await confirmOrRejectResolution(orderId, confirmed);
      onStatusChange?.(confirmed ? 'client_confirmed' : 'open');
    } catch { /* ignore */ }
    setConfirming(false);
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-3">

      {/* Bannière statut */}
      {isClosed && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
          <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#16a34a', fontSize: 16 }} />
          <p className="text-sm font-semibold text-green-700">Litige clôturé — résolu par le client</p>
        </div>
      )}

      {/* Fil de messages */}
      <div
        className="flex flex-col gap-3 overflow-y-auto rounded-xl p-3"
        style={{ background: '#F9F9F9', minHeight: 120, maxHeight: 300 }}
      >
        {/* Motif initial */}
        {loaded && initialDisputeReason && (
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white border border-gray-200 px-3 py-2 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">Client</p>
              <p className="text-sm text-gray-700">{initialDisputeReason}</p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === sender;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${
                  isMe ? 'rounded-tr-sm text-white' : 'rounded-tl-sm bg-white border border-gray-200'
                }`}
                style={isMe ? { background: '#C8860A' } : {}}
              >
                {!isMe && (
                  <p className="text-[10px] font-bold mb-1 uppercase tracking-wide text-gray-400">
                    {msg.sender === 'admin' ? 'Guinée Makiti' : 'Client'}
                  </p>
                )}
                {msg.content && (
                  <p className={`text-sm leading-relaxed ${isMe ? 'text-white' : 'text-gray-700'}`}>
                    {msg.content}
                  </p>
                )}
                {msg.file_url && (
                  isImageUrl(msg.file_url) ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.file_url} alt={msg.file_name ?? 'preuve'}
                        className="mt-1.5 max-w-[200px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                    </a>
                  ) : (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 mt-1.5 text-xs underline ${isMe ? 'text-white/80' : 'text-blue-600'}`}>
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: 11 }} />
                      {msg.file_name ?? 'Télécharger'}
                    </a>
                  )
                )}
                <p className={`text-[10px] mt-1.5 ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                  {fmtTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}

        {!loaded && (
          <div className="flex justify-center py-4">
            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 18, color: '#C8860A' }} />
          </div>
        )}
        {loaded && messages.length === 0 && !initialDisputeReason && (
          <p className="text-center text-xs text-gray-400 py-4">Aucun message pour l&apos;instant.</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bandeau confirmation client (admin a marqué résolu) */}
      {sender === 'client' && disputeStatus === 'admin_resolved' && (
        <div className="rounded-xl p-4" style={{ background: '#eff6ff', border: '1.5px solid #93c5fd' }}>
          <p className="text-sm font-semibold text-blue-800 mb-1">Notre équipe a marqué ce litige comme résolu.</p>
          <p className="text-xs text-blue-600 mb-3">Avez-vous bien reçu satisfaction ?</p>
          <div className="flex gap-2">
            <button
              disabled={confirming}
              onClick={() => handleClientResponse(true)}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#16a34a' }}
            >
              {confirming ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 14 }} /> : 'Oui, résolu ✓'}
            </button>
            <button
              disabled={confirming}
              onClick={() => handleClientResponse(false)}
              className="flex-1 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Non, problème persistant
            </button>
          </div>
        </div>
      )}

      {/* Saisie (masquée si clôturé) */}
      {!isClosed && (
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Écrire un message…"
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#C8860A] focus:ring-1 focus:ring-[#C8860A]"
          />

          <div className="flex items-center justify-between gap-2">
            {/* Bouton fichier */}
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading
                ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 13 }} />
                : <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 13 }} />
              }
              <span className="hidden sm:inline">Joindre</span>
            </button>

            {/* Bouton admin : résoudre */}
            {sender === 'admin' && disputeStatus !== 'admin_resolved' && (disputeStatus as string) !== 'client_confirmed' && (
              <button
                type="button"
                disabled={resolving}
                onClick={handleAdminResolve}
                className="flex items-center gap-1.5 rounded-xl border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
              >
                {resolving
                  ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 13 }} />
                  : <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 13 }} />
                }
                <span className="hidden sm:inline">Marquer résolu</span>
              </button>
            )}

            {/* Envoyer */}
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: '#C8860A' }}
            >
              {sending
                ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 14 }} />
                : <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 14 }} />
              }
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </form>
      )}

      {!isClosed && (
        <p className="text-[10px] text-gray-400 text-center">
          Images, PDF, documents · Rafraîchissement auto toutes les 10 s
        </p>
      )}
    </div>
  );
}
