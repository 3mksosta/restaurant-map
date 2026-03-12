'use client';

import dynamic from 'next/dynamic';
import { useState, lazy, Suspense } from 'react';
import CategorySidebar from './CategorySidebar';
import type { Category, Restaurant } from '@/types';

// تحميل الخريطة ديناميكياً لتجنب SSR
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full spin mx-auto mb-3"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>جاري تحميل الخريطة...</p>
      </div>
    </div>
  ),
});

// تحميل نافذة الدردشة بشكل كسول
const ChatWindow = lazy(() => import('./ChatWindow'));

interface Props {
  categories: Category[];
  initialRestaurants: Restaurant[];
}

export default function MapApp({ categories, initialRestaurants }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [restaurants] = useState<Restaurant[]>(initialRestaurants);
  const [chatRestaurant, setChatRestaurant] = useState<Restaurant | null>(null);

  const filtered = selectedCategory
    ? restaurants.filter(r => r.category_id === selectedCategory)
    : restaurants;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* الخريطة */}
      <div className="absolute inset-0">
        <MapClient
          restaurants={filtered}
          categories={categories}
          onChatOpen={setChatRestaurant}
        />
      </div>

      {/* شريط الأصناف */}
      <CategorySidebar
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* رابط لوحة الإدارة */}
      <a
        href="/DFG"
        className="absolute top-4 left-4 z-[1000] btn btn-secondary"
        style={{ fontSize: '12px', padding: '6px 12px' }}
      >
        ⚙️ إدارة
      </a>

      {/* نافذة الدردشة */}
      {chatRestaurant && (
        <Suspense fallback={null}>
          <ChatWindow
            restaurant={chatRestaurant}
            onClose={() => setChatRestaurant(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
