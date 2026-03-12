'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import type { Restaurant, Category } from '@/types';

const LocationPicker = lazy(() => import('@/components/LocationPicker'));

type FormState = Partial<Restaurant> & { lat: number; lng: number };

const emptyForm: FormState = {
  name: '', description: '', address: '', phone: '', whatsapp: '',
  logo_url: '', cover_url: '', is_active: true, is_featured: false,
  lat: 30.0444, lng: 31.2357, category_id: undefined,
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [r, c] = await Promise.all([
      fetch('/api/restaurants').then(x => x.json()),
      fetch('/api/categories').then(x => x.json()),
    ]);
    setRestaurants(r.data ?? []);
    setCategories(c.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); };
  const openEdit = (r: Restaurant) => { setForm({ ...r }); setEditItem(r); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.name || !form.lat || !form.lng) return alert('أدخل الاسم والموقع');
    setLoading(true);
    const method = editItem ? 'PUT' : 'POST';
    const url = editItem ? `/api/restaurants/${editItem.id}` : '/api/restaurants';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    await load();
    setShowForm(false);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف المطعم نهائياً؟')) return;
    await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
    await load();
  };

  const handleToggleActive = async (r: Restaurant) => {
    await fetch(`/api/restaurants/${r.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !r.is_active }),
    });
    await load();
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.address?.toLowerCase().includes(search.toLowerCase())
  );

  const F = (key: keyof FormState) => ({
    value: (form[key] ?? '') as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
          🍴 المطاعم ({restaurants.length})
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input className="input" style={{ width: '200px' }} placeholder="🔍 بحث..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={openAdd}>➕ مطعم جديد</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                {['المطعم', 'الصنف', 'التقييم', 'الطلبات', 'الحالة', 'الإجراءات'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: 'var(--color-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const cat = categories.find(c => c.id === r.category_id);
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {r.logo_url
                          ? <img src={r.logo_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                          : <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🍽️</div>
                        }
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>{r.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{r.address ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {cat ? <span className="badge" style={{ background: `${cat.color}22`, color: cat.color }}>{cat.icon} {cat.name}</span> : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--color-text)' }}>
                      ⭐ {r.rating?.toFixed(1) ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--color-text)' }}>
                      {r.total_orders ?? 0}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleToggleActive(r)} className={`badge ${r.is_active ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer', border: 'none' }}>
                        {r.is_active ? '● نشط' : '○ متوقف'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => openEdit(r)}>✏️ تعديل</button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => handleDelete(r.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>لا توجد مطاعم</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '640px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '20px' }}>
              {editItem ? '✏️ تعديل مطعم' : '➕ إضافة مطعم'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>اسم المطعم *</label>
                <input className="input" placeholder="اسم المطعم" {...F('name')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>الصنف</label>
                <select className="input" value={form.category_id ?? ''} onChange={e => setForm(p => ({ ...p, category_id: e.target.value ? Number(e.target.value) : undefined }))}>
                  <option value="">— بدون صنف —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>الهاتف</label>
                <input className="input" placeholder="+201xxxxxxxxx" {...F('phone')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>واتساب</label>
                <input className="input" placeholder="201xxxxxxxxx" {...F('whatsapp')} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>العنوان</label>
                <input className="input" placeholder="العنوان التفصيلي" {...F('address')} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>الوصف</label>
                <textarea className="input" placeholder="وصف قصير للمطعم" value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>رابط الشعار</label>
                <input className="input" placeholder="https://..." {...F('logo_url')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>رابط الغلاف</label>
                <input className="input" placeholder="https://..." {...F('cover_url')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="is_active" checked={form.is_active ?? true} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <label htmlFor="is_active" style={{ fontSize: '13px', color: 'var(--color-text)' }}>نشط</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="is_featured" checked={form.is_featured ?? false} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
                <label htmlFor="is_featured" style={{ fontSize: '13px', color: 'var(--color-text)' }}>مميز</label>
              </div>
            </div>

            {/* Location Picker */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>الموقع على الخريطة *</label>
              <Suspense fallback={<div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>جاري تحميل الخريطة...</div>}>
                <LocationPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm(p => ({ ...p, lat, lng }))} />
              </Suspense>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'جاري الحفظ...' : (editItem ? 'حفظ التعديلات' : 'إضافة المطعم')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
