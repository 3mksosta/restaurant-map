'use client';

import { useState, useEffect, useRef } from 'react';
import type { Restaurant, ChatMessage } from '@/types';
import { generateSessionId } from '@/lib/utils';

interface Props {
  restaurant: Restaurant;
  onClose: () => void;
}

const SESSION_KEY = 'mataem_session_id';

export default function ChatWindow({ restaurant, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // جلسة الزائر
  const getSession = () => {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) { id = generateSessionId(); sessionStorage.setItem(SESSION_KEY, id); }
    return id;
  };

  useEffect(() => {
    const init = async () => {
      const sessionId = getSession();
      const res = await fetch('/api/chat/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id, sessionId }),
      });
      const { data } = await res.json();
      if (data) {
        setRoomId(data.id);
        const msgRes = await fetch(`/api/chat/messages?roomId=${data.id}`);
        const { data: msgs } = await msgRes.json();
        setMessages(msgs ?? []);
      }
    };
    init();
  }, [restaurant.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !roomId) return;
    setLoading(true);
    const content = input.trim();
    setInput('');
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, sender: 'customer', content }),
    });
    const { data } = await res.json();
    if (data) setMessages(prev => [...prev, data]);
    setLoading(false);
  };

  return (
    <div
      className="absolute bottom-6 left-4 z-[2000] flex flex-col fade-in"
      style={{
        width: '320px', height: '460px',
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ background: 'var(--color-bg)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
          )}
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>{restaurant.name}</p>
            <p style={{ fontSize: '11px', color: 'var(--color-primary)' }}>● متصل</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '13px', marginTop: '40px' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>👋</p>
            أهلاً! كيف يمكننا مساعدتك؟
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '8px 12px',
              borderRadius: msg.sender === 'customer' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.sender === 'customer' ? 'rgba(62,207,142,0.15)' : 'var(--color-bg)',
              border: `1px solid ${msg.sender === 'customer' ? 'rgba(62,207,142,0.3)' : 'var(--color-border)'}`,
              color: 'var(--color-text)',
              fontSize: '13px',
              lineHeight: 1.5,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
        <input
          className="input"
          style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
          placeholder="اكتب رسالتك..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '8px 14px', flexShrink: 0 }}
        >
          {loading ? '...' : '↩'}
        </button>
      </div>
    </div>
  );
}
