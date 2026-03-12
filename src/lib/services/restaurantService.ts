// =============================================
// Restaurant Service — Supabase Layer
// =============================================
import { createServerClient } from '@/lib/supabase/server';
import type { Restaurant } from '@/types';
import { TABLES } from '@/lib/constants';

export async function getRestaurants(categoryId?: number): Promise<Restaurant[]> {
  const sb = createServerClient();
  let query = sb
    .from(TABLES.restaurants)
    .select(`*, category:categories(*), images:restaurant_images(*)`)
    .eq('is_active', true);

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query.order('is_featured', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as Restaurant[]) ?? [];
}

export async function getRestaurantById(id: number): Promise<Restaurant | null> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.restaurants)
    .select(`*, category:categories(*), images:restaurant_images(*), menu_items(*)`)
    .eq('id', id)
    .single();
  if (error) return null;
  return data as unknown as Restaurant;
}

export async function createRestaurant(payload: Partial<Restaurant>): Promise<Restaurant> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.restaurants)
    .insert([payload])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Restaurant;
}

export async function updateRestaurant(id: number, payload: Partial<Restaurant>): Promise<Restaurant> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.restaurants)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Restaurant;
}

export async function deleteRestaurant(id: number): Promise<void> {
  const sb = createServerClient();
  const { error } = await sb.from(TABLES.restaurants).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getAllRestaurantsAdmin(): Promise<Restaurant[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.restaurants)
    .select(`*, category:categories(name, color)`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as Restaurant[]) ?? [];
}
