'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faSpinner, faDownload } from '@/src/lib/icons';
import {
  getDisputeMessages,
  sendDisputeMessage,
  uploadDisputeFile,
  type DisputeMessage,
} from '@/src/lib/services/dispute.service';

interface DisputeChatProps {
  orderId: string;
  sender: 'client' | 'admin';
  initialDisputeReason?: string;
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
}

export default function DisputeChat({ orderId, sender, initialDisputeReason }: DisputeChatProps) {
  const [messages,  setMessages]  = useState<DisputeMessage[]>([]);
  const [text,      setText]      = useState('');
  const [sending,   setSending]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const fileRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    if (!text.trim()) return;
    setSending(true);
    try {
      const msg = await sendDisputeMessage(orderId, sender, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadDisputeFile(file, orderId);
      const msg = await sendDisputeMessage(orderId, sender, undefined, url, file.name);
      setMessages((prev) => [...prev, msg]);
    } catch { /* ignore */ }
    setUploading(false);
    e.target.value = '';
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-3">

      {/* Fil de discussion */}
      <div
        className="flex flex-col gap-3 overflow-y-auto rounded-xl p-3"
        style={{ background: '#F9F9F9', minHeight: 120, maxHeight: 300 }}
      >
        {/* Motif initial affiché comme premier message client */}
        {loaded && initialDisputeReason && (
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white border border-gray-200 px-3 py-2 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">Client</p>
              <p className="text-sm text-gray-700">{initialDisputeReason}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isMe = msg.sender === sender;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${
                  isMe
                    ? 'rounded-tr-sm text-white'
                    : 'rounded-tl-sm bg-white border border-gray-200'
                }`}
                style={isMe ? { background: '#C8860A' } : {}}
              >
                {!isMe && (
                  <p className="text-[10px] font-bold mb-1 uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
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
                      <img
                        src={msg.file_url}
                        alt={msg.file_name ?? 'preuve'}
                        className="mt-1.5 max-w-[220px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 mt-1.5 text-xs underline ${isMe ? 'text-white/80' : 'text-blue-600'}`}
                    >
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: 11 }} />
                      {msg.file_name ?? 'Télécharger le fichier'}
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

      {/* Saisie */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Joindre un fichier ou une photo"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading
            ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 15 }} />
            : <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 15 }} />
          }
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Écrire un message…"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#C8860A] focus:ring-1 focus:ring-[#C8860A]"
        />

        <button
          type="submit"
          disabled={sending || (!text.trim())}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: '#C8860A' }}
        >
          {sending
            ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 14 }} />
            : <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 14 }} />
          }
        </button>
      </form>

      <p className="text-[10px] text-gray-400 text-center">
        Images, PDF, documents acceptés · Mise à jour toutes les 10 s
      </p>
    </div>
  );
}
