'use client';

import { useState, useEffect } from 'react';
import type { Category } from '@/types';
import { CATEGORY_COLORS } from '@/lib/constants';

const ICONS = ['🍔', '🍕', '🌮', '🍜', '🍣', '🥗', '🍰', '☕', '🍗', '🥙', '🌯', '🍱', '🥩', '🍝', '🥘', '🍛'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon: '🍽️', color: '#3ecf8e' });

  const load = async () => {
    const r = await fetch('/api/categories').then(x => x.json());
    setCategories(r.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ name: '', icon: '🍽️', color: '#3ecf8e' }); setEditItem(null); setShowForm(true); };
  const openEdit = (c: Category) => { setForm({ name: c.name, icon: c.icon, color: c.color }); setEditItem(c); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.name) return alert('أدخل اسم الصنف');
    if (editItem) {
      await fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editItem.id, ...form }) });
    } else {
      await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    await load(); setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف الصنف؟')) return;
    await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>📂 الأصناف</h1>
        <button className="btn btn-primary" onClick={openAdd}>➕ صنف جديد</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {categories.map(cat => (
          <div key={cat.id} className="card fade-in" style={{ borderTop: `3px solid ${cat.color}` }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cat.icon}</div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text)' }}>{cat.name}</p>
            <p style={{ fontSize: '12px', color: cat.color, marginTop: '4px', fontFamily: 'Fira Code, monospace' }}>{cat.color}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '6px' }} onClick={() => openEdit(cat)}>✏️</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '6px' }} onClick={() => handleDelete(cat.id)}>🗑️</button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--color-muted)' }}>
            لا توجد أصناف — أضف الآن!
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '460px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '20px' }}>
              {editItem ? '✏️ تعديل صنف' : '➕ صنف جديد'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>اسم الصنف</label>
                <input className="input" placeholder="مثال: مشويات" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>الأيقونة</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', border: `2px solid ${form.icon === ic ? 'var(--color-primary)' : 'var(--color-border)'}`, background: form.icon === ic ? 'rgba(62,207,142,0.1)' : 'var(--color-bg)', cursor: 'pointer', fontSize: '20px' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>اللون</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATEGORY_COLORS.map(color => (
                    <button key={color} onClick={() => setForm(p => ({ ...p, color }))}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, border: form.color === color ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === color ? `0 0 0 2px ${color}` : 'none' }}>
                    </button>
                  ))}
                  <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-border)', cursor: 'pointer', padding: '2px', background: 'transparent' }} />
                </div>
              </div>

              {/* Preview */}
              <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--color-bg)', border: `2px solid ${form.color}`, textAlign: 'center' }}>
                <span style={{ fontSize: '28px' }}>{form.icon}</span>
                <p style={{ color: form.color, fontWeight: 700, marginTop: '4px' }}>{form.name || 'معاينة'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleSubmit}>حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
