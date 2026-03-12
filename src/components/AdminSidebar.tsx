'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/DFG/dashboard', icon: '📊', label: 'الداشبورد' },
  { href: '/DFG/dashboard/restaurants', icon: '🍴', label: 'المطاعم' },
  { href: '/DFG/dashboard/categories', icon: '📂', label: 'الأصناف' },
  { href: '/DFG/dashboard/subscriptions', icon: '💳', label: 'الاشتراكات' },
  { href: '/DFG/dashboard/coupons', icon: '🏷️', label: 'الكوبونات' },
  { href: '/DFG/dashboard/chats', icon: '💬', label: 'الدردشات' },
  { href: '/DFG/dashboard/admins', icon: '👥', label: 'المدراء' },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/DFG');
    router.refresh();
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🗺️</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text)' }}>مطاعم ماب</p>
            <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>لوحة التحكم</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/DFG/dashboard' && pathname.startsWith(item.href));
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '10px', marginBottom: '4px',
                background: active ? 'rgba(62,207,142,0.12)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                fontWeight: active ? 700 : 500, fontSize: '14px',
                textDecoration: 'none', transition: 'all 0.15s ease',
                borderRight: active ? '3px solid var(--color-primary)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
        <a href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: 'var(--color-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '4px' }}>
          🌐 عرض الموقع
        </a>
        <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
          🚪 تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>
      {/* Desktop Sidebar */}
      <aside style={{ width: '220px', flexShrink: 0, background: 'var(--color-card)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }} className="hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 2000, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '18px' }}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1999 }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <aside style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '240px', background: 'var(--color-card)', borderLeft: '1px solid var(--color-border)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {children}
      </main>
    </div>
  );
}
