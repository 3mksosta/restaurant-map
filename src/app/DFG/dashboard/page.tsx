import { createServerClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import { getExpiringSoon } from '@/lib/services/subscriptionService';

async function getStats() {
  const sb = createServerClient();
  const [r, c, s, ch] = await Promise.all([
    sb.from(TABLES.restaurants).select('id, is_active, rating', { count: 'exact' }),
    sb.from(TABLES.categories).select('id', { count: 'exact' }),
    sb.from(TABLES.subscriptions).select('id, is_active, total_due_this_month', { count: 'exact' }),
    sb.from(TABLES.chatRooms).select('id, is_read', { count: 'exact' }),
  ]);
  const restaurants = (r.data as unknown as { is_active: boolean; rating: number }[]) ?? [];
  const subs = (s.data as unknown as { is_active: boolean; total_due_this_month: number }[]) ?? [];
  const chats = (ch.data as unknown as { is_read: boolean }[]) ?? [];

  return {
    totalRestaurants: r.count ?? 0,
    activeRestaurants: restaurants.filter(x => x.is_active).length,
    totalCategories: c.count ?? 0,
    totalSubscriptions: s.count ?? 0,
    activeSubscriptions: subs.filter(x => x.is_active).length,
    totalDue: subs.reduce((acc, x) => acc + (x.total_due_this_month ?? 0), 0),
    unreadChats: chats.filter(x => !x.is_read).length,
    avgRating: restaurants.length > 0
      ? (restaurants.reduce((acc, x) => acc + (x.rating ?? 0), 0) / restaurants.length).toFixed(2)
      : '0.00',
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const expiring = await getExpiringSoon(3).catch(() => []);

  const cards = [
    { label: 'إجمالي المطاعم', value: stats.totalRestaurants, sub: `${stats.activeRestaurants} نشط`, icon: '🍴', color: '#3ecf8e' },
    { label: 'الاشتراكات الفعّالة', value: stats.activeSubscriptions, sub: `من ${stats.totalSubscriptions} إجمالي`, icon: '💳', color: '#8b5cf6' },
    { label: 'الإيرادات المتوقعة', value: `${stats.totalDue.toFixed(2)} ج.م`, sub: 'هذا الشهر', icon: '💰', color: '#f59e0b' },
    { label: 'دردشات غير مقروءة', value: stats.unreadChats, sub: 'تحتاج رد', icon: '💬', color: '#ef4444' },
    { label: 'الأصناف', value: stats.totalCategories, sub: 'صنف متاح', icon: '📂', color: '#06b6d4' },
    { label: 'متوسط التقييم', value: stats.avgRating, sub: 'من 5 نجوم', icon: '⭐', color: '#f97316' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '24px' }}>
        مرحباً بك 👋
      </h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {cards.map(card => (
          <div key={card.label} className="card fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '-12px', width: '60px', height: '60px', borderRadius: '50%', background: `${card.color}15` }} />
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
            <p style={{ fontSize: '28px', fontWeight: 800, color: card.color }}>{card.value}</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>{card.label}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* تنبيه انتهاء الاشتراكات */}
      {expiring.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', marginBottom: '12px' }}>
            ⚠️ اشتراكات ستنتهي قريباً ({expiring.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expiring.map(sub => (
              <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-text)' }}>
                <span>{(sub.restaurant as unknown as { name: string })?.name ?? `مطعم #${sub.restaurant_id}`}</span>
                <span style={{ color: '#f59e0b' }}>ينتهي: {sub.end_date}</span>
              </div>
            ))}
          </div>
          <a href="/DFG/dashboard/subscriptions" style={{ display: 'inline-block', marginTop: '12px', fontSize: '13px', color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>
            إدارة الاشتراكات ←
          </a>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { href: '/DFG/dashboard/restaurants', label: 'إضافة مطعم', icon: '➕' },
          { href: '/DFG/dashboard/subscriptions', label: 'إدارة الاشتراكات', icon: '💳' },
          { href: '/DFG/dashboard/chats', label: 'الرد على الدردشات', icon: '💬' },
          { href: '/DFG/dashboard/coupons', label: 'إنشاء كوبون', icon: '🏷️' },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 16px', borderRadius: '10px',
              background: 'var(--color-card)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
          >
            <span style={{ fontSize: '20px' }}>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
