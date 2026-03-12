import { getCategories } from '@/lib/services/categoryService';
import { getRestaurants } from '@/lib/services/restaurantService';
import MapApp from '@/components/MapApp';
import type { Category, Restaurant } from '@/types';

export const revalidate = 60; // ISR كل دقيقة

export default async function HomePage() {
  let categories: Category[] = [];
  let restaurants: Restaurant[] = [];

  try {
    [categories, restaurants] = await Promise.all([
      getCategories(),
      getRestaurants(),
    ]);
  } catch {
    // fallback: الصفحة تعمل حتى لو فيه مشكلة في الـ DB
  }

  return <MapApp categories={categories} initialRestaurants={restaurants} />;
}
