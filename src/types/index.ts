// =============================================
// مطاعم ماب — Shared TypeScript Types
// =============================================

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  category_id: number | null;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  cover_url: string | null;
  rating: number;
  total_ratings: number;
  total_orders: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: RestaurantImage[];
  menu_items?: MenuItem[];
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface RestaurantImage {
  id: number;
  restaurant_id: number;
  url: string;
  created_at: string;
}

export interface Rating {
  id: number;
  restaurant_id: number;
  stars: number;
  comment: string | null;
  created_at: string;
}

export interface Coupon {
  id: number;
  restaurant_id: number;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  restaurant_id: number;
  session_id: string;
  customer_name: string;
  is_read: boolean;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  restaurant?: Pick<Restaurant, 'id' | 'name'>;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender: 'customer' | 'admin';
  content: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  restaurant_id: number;
  plan_type: 'fixed' | 'per_order';
  monthly_fee: number;
  per_order_fee: number;
  per_order_percent: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  total_orders_this_month: number;
  total_due_this_month: number;
  created_at: string;
  updated_at: string;
  restaurant?: Pick<Restaurant, 'id' | 'name'>;
}

export interface Admin {
  id: number;
  username: string;
  role: 'super' | 'manager' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export interface AdminSession {
  id: number;
  username: string;
  role: 'super' | 'manager' | 'viewer';
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
