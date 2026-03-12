'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg ?? 'خطأ في تسجيل الدخول');
      } else {
        router.push('/DFG/dashboard');
        router.refresh();
      }
    } catch {
      setError('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(62,207,142,0.25)',
          }}>🗺️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>مطاعم ماب</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>لوحة التحكم</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '6px' }}>اسم المستخدم</label>
              <input
                className="input"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--color-muted)', display: 'block', marginBottom: '6px' }}>كلمة المرور</label>
              <input
                className="input"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              {loading ? <span className="spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #0a0f1e', borderTopColor: 'transparent', borderRadius: '50%' }} /> : 'تسجيل الدخول'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--color-muted)' }}>
          مطاعم ماب © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
