'use client';

import { useState, useEffect } from 'react';
import type { Admin } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'manager' as Admin['role'] });
  const [error, setError] = useState('');

  const load = async () => {
    const r = await fetch('/api/admin/admins').then(x => x.json());
    if (r.error) setError(r.error);
    else setAdmins(r.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.username || !form.password) return alert('أدخل اسم المستخدم وكلمة المرور');
    const r = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await r.json();
    if (data.error) return alert(data.error);
    await load(); setShowForm(false);
    setForm({ username: '', password: '', role: 'manager' });
  };

  const toggleActive = async (admin: Admin) => {
    await fetch('/api/admin/admins', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: admin.id, is_active: !admin.is_active }) });
    await load();
  };

  const deleteAdmin = async (id: number) => {
    if (!confirm('حذف المدير؟')) return;
    await fetch('/api/admin/admins', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  };

  const roleLabels: Record<Admin['role'], { label: string; badge: string }> = {
    super: { label: 'سوبر أدمن', badge: 'badge-purple' },
    manager: { label: 'مدير', badge: 'badge-green' },
    viewer: { label: 'مشاهد', badge: 'badge-yellow' },
  };

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</p>
      <p>هذه الصفحة متاحة للسوبر أدمن فقط</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>👥 المدراء</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ مدير جديد</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
              {['اسم المستخدم', 'الصلاحية', 'تاريخ الإضافة', 'الحالة', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: 'var(--color-muted)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => {
              const r = roleLabels[admin.role];
              return (
                <tr key={admin.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'Fira Code' }}>{admin.username}</td>
                  <td style={{ padding: '14px 16px' }}><span className={`badge ${r.badge}`}>{r.label}</span></td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-muted)' }}>{formatDate(admin.created_at)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${admin.is_active ? 'badge-green' : 'badge-red'}`}>
                      {admin.is_active ? 'فعّال' : 'معطل'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => toggleActive(admin)}>
                        {admin.is_active ? '⏸' : '▶'}
                      </button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => deleteAdmin(admin.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '20px' }}>👥 مدير جديد</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>اسم المستخدم</label>
                <input className="input" placeholder="username" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>كلمة المرور</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'block', marginBottom: '5px' }}>الصلاحية</label>
                <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Admin['role'] }))}>
                  <option value="super">سوبر أدمن</option>
                  <option value="manager">مدير</option>
                  <option value="viewer">مشاهد</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleAdd}>إضافة المدير</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
