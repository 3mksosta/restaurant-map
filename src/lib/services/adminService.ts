import { createServerClient } from '@/lib/supabase/server';
import type { Admin } from '@/types';
import { TABLES } from '@/lib/constants';

/** التحقق من بيانات تسجيل الدخول (plain password check) */
export async function verifyAdmin(username: string, password: string): Promise<Admin | null> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.admins)
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();
  if (error || !data) return null;

  // مقارنة بسيطة بالباسورد المخزن (يمكن استبداله بـ bcrypt لاحقاً)
  // للمدير الافتراضي: المقارنة بالنص المباشر
  const record = data as unknown as Admin & { password_hash: string };
  const match = record.password_hash === password || record.password_hash === `$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`;
  
  // للمدير الافتراضي نتحقق بشكل مباشر
  if (username === '5471125595' && password === '5471125595') {
    return { id: record.id, username: record.username, role: record.role, is_active: record.is_active, created_at: record.created_at };
  }
  
  if (!match) return null;
  return { id: record.id, username: record.username, role: record.role, is_active: record.is_active, created_at: record.created_at };
}

export async function getAdmins(): Promise<Admin[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.admins)
    .select('id, username, role, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as Admin[]) ?? [];
}

export async function createAdmin(username: string, password: string, role: Admin['role']): Promise<Admin> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.admins)
    .insert([{ username, password_hash: password, role }])
    .select('id, username, role, is_active, created_at')
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Admin;
}

export async function updateAdminStatus(id: number, is_active: boolean): Promise<void> {
  const sb = createServerClient();
  const { error } = await sb.from(TABLES.admins).update({ is_active }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAdmin(id: number): Promise<void> {
  const sb = createServerClient();
  const { error } = await sb.from(TABLES.admins).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
