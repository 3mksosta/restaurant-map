'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatRoom, ChatMessage } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ChatsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadRooms = async () => {
    const r = await fetch('/api/admin/chats').then(x => x.json());
    setRooms(r.data ?? []);
  };

  const loadMessages = async (roomId: number) => {
    const r = await fetch(`/api/admin/chats?roomId=${roomId}`).then(x => x.json());
    setMessages(r.data ?? []);
  };

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    if (selectedRoom) loadMessages(selectedRoom.id);
  }, [selectedRoom]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedRoom) return;
    await fetch('/api/admin/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selectedRoom.id, content: reply }),
    });
    setReply('');
    await loadMessages(selectedRoom.id);
  };

  const unreadCount = rooms.filter(r => !r.is_read).length;

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '24px' }}>
        💬 الدردشات {unreadCount > 0 && <span className="badge badge-red" style={{ fontSize: '13px', marginRight: '8px' }}>{unreadCount} جديد</span>}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', height: 'calc(100vh - 160px)' }}>
        {/* Rooms List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>
            المحادثات ({rooms.length})
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {rooms.map(room => {
              const isSelected = selectedRoom?.id === room.id;
              const restName = (room.restaurant as unknown as { name?: string })?.name ?? `مطعم #${room.restaurant_id}`;
              return (
                <div key={room.id} onClick={() => setSelectedRoom(room)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)',
                    background: isSelected ? 'rgba(62,207,142,0.08)' : 'transparent',
                    borderRight: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>{room.customer_name}</p>
                    {!room.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: '4px' }} />}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginBottom: '2px' }}>{restName}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.last_message ?? 'لا توجد رسائل'}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>{formatDate(room.updated_at)}</p>
                </div>
              );
            })}
            {rooms.length === 0 && <p style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '14px' }}>لا توجد دردشات</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selectedRoom ? (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '15px', color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💬 {selectedRoom.customer_name}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 400 }}>
                  {(selectedRoom.restaurant as unknown as { name?: string })?.name ?? ''}
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '65%', padding: '10px 14px',
                      borderRadius: msg.sender === 'admin' ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                      background: msg.sender === 'admin' ? 'rgba(139,92,246,0.15)' : 'var(--color-bg)',
                      border: `1px solid ${msg.sender === 'admin' ? 'rgba(139,92,246,0.3)' : 'var(--color-border)'}`,
                      color: 'var(--color-text)', fontSize: '14px', lineHeight: 1.5,
                    }}>
                      {msg.sender === 'admin' && <p style={{ fontSize: '11px', color: 'var(--color-secondary)', marginBottom: '4px' }}>👤 المدير</p>}
                      {msg.content}
                      <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>{new Date(msg.created_at).toLocaleTimeString('ar-EG')}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
                <input className="input" style={{ flex: 1 }} placeholder="اكتب ردك..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} />
                <button className="btn btn-primary" onClick={sendReply} disabled={!reply.trim()}>إرسال ↩</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '14px' }}>
              اختر محادثة للرد عليها
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
