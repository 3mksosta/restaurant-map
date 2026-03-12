-- =============================================
-- مطاعم ماب — Database Schema
-- =============================================

-- جدول الأصناف
create table if not exists categories (
  id bigint primary key generated always as identity,
  name text not null,
  icon text default '🍽️',
  color text default '#3ecf8e',
  created_at timestamp default now()
);

-- جدول المطاعم
create table if not exists restaurants (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  category_id bigint references categories(id) on delete set null,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  address text,
  phone text,
  whatsapp text,
  logo_url text,
  cover_url text,
  rating numeric(3, 2) default 0,
  total_ratings int default 0,
  total_orders int default 0,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- جدول المنيو
create table if not exists menu_items (
  id bigint primary key generated always as identity,
  restaurant_id bigint references restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  image_url text,
  is_available boolean default true,
  created_at timestamp default now()
);

-- جدول صور المطاعم
create table if not exists restaurant_images (
  id bigint primary key generated always as identity,
  restaurant_id bigint references restaurants(id) on delete cascade,
  url text not null,
  created_at timestamp default now()
);

-- جدول التقييمات
create table if not exists ratings (
  id bigint primary key generated always as identity,
  restaurant_id bigint references restaurants(id) on delete cascade,
  stars int check (stars between 1 and 5),
  comment text,
  created_at timestamp default now()
);

-- جدول الكوبونات
create table if not exists coupons (
  id bigint primary key generated always as identity,
  restaurant_id bigint references restaurants(id) on delete cascade,
  code text not null unique,
  discount_type text check (discount_type in ('percent', 'fixed')) default 'percent',
  discount_value numeric(10, 2) not null,
  min_order numeric(10, 2) default 0,
  max_uses int default 100,
  used_count int default 0,
  expires_at timestamp,
  is_active boolean default true,
  created_at timestamp default now()
);

-- جدول غرف الدردشة
create table if not exists chat_rooms (
  id bigint primary key generated always as identity,
  restaurant_id bigint references restaurants(id) on delete cascade,
  session_id text not null,
  customer_name text default 'زائر',
  is_read boolean default false,
  last_message text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- جدول رسائل الدردشة
create table if not exists chat_messages (
  id bigint primary key generated always as identity,
  room_id bigint references chat_rooms(id) on delete cascade,
  sender text check (sender in ('customer', 'admin')) not null,
  content text not null,
  created_at timestamp default now()
);

-- جدول الاشتراكات
create table if not exists subscriptions (
  id bigint primary key generated always as identity,
  restaurant_id bigint references restaurants(id) on delete cascade,
  plan_type text not null check (plan_type in ('fixed', 'per_order')),
  monthly_fee numeric(10, 2) default 0,
  per_order_fee numeric(10, 2) default 0,
  per_order_percent numeric(5, 2) default 0,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  total_orders_this_month int default 0,
  total_due_this_month numeric(10, 2) default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- جدول المدراء
create table if not exists admins (
  id bigint primary key generated always as identity,
  username text not null unique,
  password_hash text not null,
  role text check (role in ('super', 'manager', 'viewer')) default 'manager',
  is_active boolean default true,
  created_at timestamp default now()
);

-- إدراج المدير الافتراضي (باسورد: 5471125595 — مشفر بـ bcrypt)
-- ملاحظة: هذا hash للباسورد '5471125595'، يمكن تغييره لاحقاً
insert into admins (username, password_hash, role)
values (
  '5471125595',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'super'
) on conflict (username) do nothing;

-- Indexes للأداء
create index if not exists idx_restaurants_category on restaurants(category_id);
create index if not exists idx_restaurants_active on restaurants(is_active);
create index if not exists idx_menu_restaurant on menu_items(restaurant_id);
create index if not exists idx_ratings_restaurant on ratings(restaurant_id);
create index if not exists idx_subscriptions_restaurant on subscriptions(restaurant_id);
create index if not exists idx_subscriptions_active on subscriptions(is_active);
create index if not exists idx_chat_rooms_restaurant on chat_rooms(restaurant_id);
create index if not exists idx_chat_messages_room on chat_messages(room_id);
