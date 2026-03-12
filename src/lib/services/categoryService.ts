import { createServerClient } from '@/lib/supabase/server';
import type { Category } from '@/types';
import { TABLES } from '@/lib/constants';

export async function getCategories(): Promise<Category[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.categories)
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as Category[]) ?? [];
}

export async function createCategory(payload: Partial<Category>): Promise<Category> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.categories)
    .insert([payload])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Category;
}

export async function updateCategory(id: number, payload: Partial<Category>): Promise<Category> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.categories)
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Category;
}

export async function deleteCategory(id: number): Promise<void> {
  const sb = createServerClient();
  const { error } = await sb.from(TABLES.categories).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
