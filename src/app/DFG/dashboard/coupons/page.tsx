'use client';

import { useState, useEffect } from 'react';
import type { Coupon, Restaurant } from '@/types';
import { formatDate } from '@/lib/utils';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    restaurant_id: '', code: '', discount_type: 'percent',
    discount_value: '', min_order: '', max_uses: '100', expires_at: '', is_active: true,
  });

  const load = async () => {
    const [c, r] = await Promise.all([
      fetch('/api/admin/coupons').then(x => x.json()),
      fetch('/api/restaurants').then(x => x.json()),
    ]);
    setCoupons(c.data ?? []); setRestaurants(r.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const genCode = () => {
    const code = 'FOOD' + Math.random().toString(36).slice(2, 7).toUpperCase();
    setForm(p => ({ ...p, code }));
  };

  const handleSubmit = async () => {
    if (!form.restaurant_id || !form.code || !form.discount_value) return alert('أكمل البيانات');
    await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: Number(form.restaurant_id),
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order: Number(form.min_order) || 0,
        max_uses: Number(form.max_uses) || 100,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
      }),
    });
    await load(); setShowForm(false);
    setForm({ restaurant_id: '', code: '', discount_type: 'percent', discount_value: '', min_order: '', max_uses: '100', expires_at: '', is_active: true });
  };

  const toggleCoupon = async (c: Coupon) => {
    await fetch('/api/admin/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, is_active: !c.is_active }) });
    await load();
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('حذف الكوبون؟')) return;
    await fetch('/api/admin/coupons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>🏷️ الكوبونات</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ كوبون جديد</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {coupons.map(coupon => {
          const rest = restaurants.find(r => r.id === coupon.restaurant_id);
          return (
            <div key={coupon.id} className="card fade-in" style={{ opacity: coupon.is_active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontFamily: 'Fira Code, monospace', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '2px' }}>{coupon.code}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{rest?.name ?? '—'}</p>
                </div>
                <span className={`badge ${coupon.discount_type === 'percent' ? 'badge-purple' : 'badge-yellow'}`}>
                  {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `${coupon.discount_value} ج.م`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12px' }}>
                <span>الاستخدام: {coupon.used_count}/{coupon.max_uses}</span>
                {coupon.min_order > 0 && <span>الحد الأدنى: {coupon.min_order} ج.م</span>}
              </div>
              {coupon.expires_at && <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12px' }}>ينتهي: {formatDate(coupon.expires_at)}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={`btn ${coupon.is_active ? 'btn-secondary' : 'btn-primary'}`} style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }} onClick={() => toggleCoupon(coupon)}>
                  {coupon.is_active ? '⏸ تعطيل' : '▶ تفعيل'}
                </button>
                <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => deleteCoupon(coupon.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--color-muted)' }}>لا توجد كوبونات</div>}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '20px' }}>🏷️ كوبون جديد</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>المطعم</label>
                <select className="input" value={form.restaurant_id} onChange={e => setForm(p => ({ ...p, restaurant_id: e.target.value }))}>
                  <option value="">— اختر مطعم —</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>كود الكوبون</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input" style={{ flex: 1, fontFamily: 'Fira Code', letterSpacing: '2px', textTransform: 'uppercase' }} placeholder="FOOD2024" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
                  <button className="btn btn-secondary" onClick={genCode} style={{ flexShrink: 0 }}>🎲</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>نوع الخصم</label>
                  <select className="input" value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))}>
                    <option value="percent">نسبة %</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>قيمة الخصم</label>
                  <input className="input" type="number" placeholder="10" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>الحد الأدنى للطلب</label>
                  <input className="input" type="number" placeholder="0" value={form.min_order} onChange={e => setForm(p => ({ ...p, min_order: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>أقصى عدد استخدامات</label>
                  <input className="input" type="number" placeholder="100" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>تاريخ الانتهاء</label>
                <input className="input" type="datetime-local" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleSubmit}>إنشاء الكوبون</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
