// =============================================
// مطاعم ماب — Client-safe Utilities
// =============================================

/** حساب المسافة بين نقطتين بالكيلومتر (Haversine) */
export function calcDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** تنسيق السعر بالعملة */
export function formatPrice(price: number, currency = 'ج.م'): string {
  return `${price.toFixed(2)} ${currency}`;
}

/** تنسيق التاريخ بالعربية */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** إنشاء session id عشوائي للدردشة */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** اقتطاع النص إذا كان طويلاً */
export function truncate(text: string, max = 60): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

/** دمج class names */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** التحقق من انتهاء الاشتراك قريباً */
export function isExpiringSoon(endDate: string, days = 3): boolean {
  const end = new Date(endDate);
  const now = new Date();
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

/** ترتيب المطاعم حسب المعيار */
export type SortBy = 'distance' | 'rating' | 'orders';

export function sortRestaurants<T extends { rating: number; total_orders: number; lat: number; lng: number }>(
  restaurants: T[],
  sortBy: SortBy,
  userLat?: number,
  userLng?: number
): T[] {
  return [...restaurants].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'orders') return b.total_orders - a.total_orders;
    if (sortBy === 'distance' && userLat && userLng) {
      return calcDistance(userLat, userLng, a.lat, a.lng) - calcDistance(userLat, userLng, b.lat, b.lng);
    }
    return 0;
  });
}
