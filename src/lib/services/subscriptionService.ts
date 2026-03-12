import { createServerClient } from '@/lib/supabase/server';
import type { Subscription } from '@/types';
import { TABLES } from '@/lib/constants';

export async function getSubscriptions(): Promise<Subscription[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.subscriptions)
    .select(`*, restaurant:restaurants(id, name)`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as Subscription[]) ?? [];
}

export async function getSubscriptionByRestaurant(restaurantId: number): Promise<Subscription | null> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.subscriptions)
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data as unknown as Subscription;
}

export async function createSubscription(payload: Partial<Subscription>): Promise<Subscription> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.subscriptions)
    .insert([payload])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Subscription;
}

export async function updateSubscription(id: number, payload: Partial<Subscription>): Promise<Subscription> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.subscriptions)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Subscription;
}

/** المطاعم التي اشتراكها سينتهي خلال X أيام */
export async function getExpiringSoon(days = 3): Promise<Subscription[]> {
  const sb = createServerClient();
  const future = new Date();
  future.setDate(future.getDate() + days);
  const { data, error } = await sb
    .from(TABLES.subscriptions)
    .select(`*, restaurant:restaurants(id, name)`)
    .eq('is_active', true)
    .not('end_date', 'is', null)
    .lte('end_date', future.toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0]);
  if (error) throw new Error(error.message);
  return (data as unknown as Subscription[]) ?? [];
}

/** إيقاف الاشتراكات المنتهية تلقائياً */
export async function deactivateExpiredSubscriptions(): Promise<void> {
  const sb = createServerClient();
  const today = new Date().toISOString().split('T')[0];
  await sb
    .from(TABLES.subscriptions)
    .update({ is_active: false })
    .eq('is_active', true)
    .not('end_date', 'is', null)
    .lt('end_date', today);
}
