// =============================================
// مطاعم ماب — Constants & Config
// =============================================

export const COLORS = {
  bg: '#0a0f1e',
  card: '#1a1f2e',
  primary: '#3ecf8e',
  secondary: '#8b5cf6',
  text: '#e2e8f0',
  muted: '#64748b',
  border: '#2a2f3e',
} as const;

// Default map center (القاهرة)
export const DEFAULT_MAP_CENTER: [number, number] = [30.0444, 31.2357];
export const DEFAULT_MAP_ZOOM = 12;

// Category colors palette
export const CATEGORY_COLORS = [
  '#3ecf8e', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#f97316', '#ec4899', '#10b981',
];

// Supabase storage bucket
export const STORAGE_BUCKET = 'restaurants';

// JWT config
export const JWT_COOKIE_NAME = 'admin_token';
export const JWT_EXPIRES_IN = '7d';

// Subscription warning days
export const SUBSCRIPTION_WARNING_DAYS = 3;

// Table names
export const TABLES = {
  restaurants: 'restaurants',
  categories: 'categories',
  menuItems: 'menu_items',
  restaurantImages: 'restaurant_images',
  ratings: 'ratings',
  coupons: 'coupons',
  chatRooms: 'chat_rooms',
  chatMessages: 'chat_messages',
  subscriptions: 'subscriptions',
  admins: 'admins',
} as const;
