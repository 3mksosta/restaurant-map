'use client';

import { useState, useEffect } from 'react';
import type { Subscription, Restaurant } from '@/types';
import { formatDate, isExpiringSoon } from '@/lib/utils';

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Subscription | null>(null);
  const [form, setForm] = useState({
    restaurant_id: '', plan_type: 'fixed',
    monthly_fee: '', per_order_fee: '', per_order_percent: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '', is_active: true,
  });

  const load = async () => {
    const [s, r] = await Promise.all([
      fetch('/api/admin/subscriptions').then(x => x.json()),
      fetch('/api/restaurants').then(x => x.json()),
    ]);
    setSubs(s.data ?? []);
    setRestaurants(r.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ restaurant_id: '', plan_type: 'fixed', monthly_fee: '', per_order_fee: '', per_order_percent: '', start_date: new Date().toISOString().split('T')[0], end_date: '', is_active: true });
    setEditItem(null); setShowForm(true);
  };
  const openEdit = (s: Subscription) => {
    setForm({
      restaurant_id: String(s.restaurant_id), plan_type: s.plan_type,
      monthly_fee: String(s.monthly_fee), per_order_fee: String(s.per_order_fee),
      per_order_percent: String(s.per_order_percent),
      start_date: s.start_date, end_date: s.end_date ?? '', is_active: s.is_active,
    });
    setEditItem(s); setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.restaurant_id) return alert('اختر المطعم');
    const payload = {
      restaurant_id: Number(form.restaurant_id),
      plan_type: form.plan_type,
      monthly_fee: Number(form.monthly_fee) || 0,
      per_order_fee: Number(form.per_order_fee) || 0,
      per_order_percent: Number(form.per_order_percent) || 0,
      start_date: form.start_date,
      end_date: form.end_date || null,
      is_active: form.is_active,
    };
    if (editItem) {
      await fetch('/api/admin/subscriptions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editItem.id, ...payload }) });
    } else {
      await fetch('/api/admin/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    await load(); setShowForm(false);
  };

  const totalDue = subs.filter(s => s.is_active).reduce((acc, s) => acc + (s.total_due_this_month ?? 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>💳 الاشتراكات</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.3)', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 700 }}>
            الإيرادات: {totalDue.toFixed(2)} ج.م
          </div>
          <button className="btn btn-primary" onClick={openAdd}>➕ اشتراك جديد</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                {['المطعم', 'النوع', 'القيمة', 'البداية', 'النهاية', 'المستحق', 'الحالة', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: 'var(--color-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map(sub => {
                const rest = restaurants.find(r => r.id === sub.restaurant_id);
                const expiring = sub.end_date ? isExpiringSoon(sub.end_date) : false;
                return (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text)', fontSize: '14px' }}>
                      {rest?.name ?? `#${sub.restaurant_id}`}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${sub.plan_type === 'fixed' ? 'badge-purple' : 'badge-yellow'}`}>
                        {sub.plan_type === 'fixed' ? '📅 شهري' : '📦 حسب الطلب'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text)', fontFamily: 'Fira Code' }}>
                      {sub.plan_type === 'fixed'
                        ? `${sub.monthly_fee} ج.م/شهر`
                        : sub.per_order_percent > 0
                          ? `${sub.per_order_percent}%/طلب`
                          : `${sub.per_order_fee} ج.م/طلب`}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-muted)' }}>{formatDate(sub.start_date)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      {sub.end_date
                        ? <span style={{ color: expiring ? '#f59e0b' : 'var(--color-muted)' }}>
                            {expiring ? '⚠️ ' : ''}{formatDate(sub.end_date)}
                          </span>
                        : <span style={{ color: 'var(--color-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-primary)', fontFamily: 'Fira Code' }}>
                      {sub.total_due_this_month?.toFixed(2) ?? '0.00'} ج.م
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${sub.is_active ? 'badge-green' : 'badge-red'}`}>
                        {sub.is_active ? 'فعّال' : 'منتهي'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => openEdit(sub)}>✏️</button>
                    </td>
                  </tr>
                );
              })}
              {subs.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>لا توجد اشتراكات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '20px' }}>
              {editItem ? '✏️ تعديل اشتراك' : '➕ اشتراك جديد'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>المطعم</label>
                <select className="input" value={form.restaurant_id} onChange={e => setForm(p => ({ ...p, restaurant_id: e.target.value }))}>
                  <option value="">— اختر مطعم —</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>نوع الاشتراك</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ v: 'fixed', l: '📅 شهري ثابت' }, { v: 'per_order', l: '📦 حسب الطلبات' }].map(opt => (
                    <button key={opt.v} onClick={() => setForm(p => ({ ...p, plan_type: opt.v }))}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${form.plan_type === opt.v ? 'var(--color-primary)' : 'var(--color-border)'}`, background: form.plan_type === opt.v ? 'rgba(62,207,142,0.1)' : 'var(--color-bg)', color: form.plan_type === opt.v ? 'var(--color-primary)' : 'var(--color-text)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Cairo', fontWeight: 600 }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              {form.plan_type === 'fixed' && (
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>الرسوم الشهرية (ج.م)</label>
                  <input className="input" type="number" placeholder="200" value={form.monthly_fee} onChange={e => setForm(p => ({ ...p, monthly_fee: e.target.value }))} />
                </div>
              )}
              {form.plan_type === 'per_order' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>رسوم ثابتة/طلب (ج.م)</label>
                    <input className="input" type="number" placeholder="5" value={form.per_order_fee} onChange={e => setForm(p => ({ ...p, per_order_fee: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>نسبة مئوية/طلب (%)</label>
                    <input className="input" type="number" placeholder="5" value={form.per_order_percent} onChange={e => setForm(p => ({ ...p, per_order_percent: e.target.value }))} />
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>تاريخ البداية</label>
                  <input className="input" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>تاريخ الانتهاء</label>
                  <input className="input" type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="sub_active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <label htmlFor="sub_active" style={{ fontSize: '13px', color: 'var(--color-text)' }}>اشتراك فعّال</label>
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
