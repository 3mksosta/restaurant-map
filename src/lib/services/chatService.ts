import { createServerClient } from '@/lib/supabase/server';
import type { ChatRoom, ChatMessage } from '@/types';
import { TABLES } from '@/lib/constants';

export async function getOrCreateRoom(restaurantId: number, sessionId: string, customerName?: string): Promise<ChatRoom> {
  const sb = createServerClient();
  const { data: existing } = await sb
    .from(TABLES.chatRooms)
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('session_id', sessionId)
    .single();

  if (existing) return existing as unknown as ChatRoom;

  const { data, error } = await sb
    .from(TABLES.chatRooms)
    .insert([{ restaurant_id: restaurantId, session_id: sessionId, customer_name: customerName ?? 'زائر' }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as ChatRoom;
}

export async function getRoomMessages(roomId: number): Promise<ChatMessage[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.chatMessages)
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as ChatMessage[]) ?? [];
}

export async function sendMessage(roomId: number, sender: 'customer' | 'admin', content: string): Promise<ChatMessage> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.chatMessages)
    .insert([{ room_id: roomId, sender, content }])
    .select()
    .single();
  if (error) throw new Error(error.message);

  // تحديث آخر رسالة في الغرفة
  await sb
    .from(TABLES.chatRooms)
    .update({ last_message: content, is_read: sender === 'admin', updated_at: new Date().toISOString() })
    .eq('id', roomId);

  return data as unknown as ChatMessage;
}

export async function getAllRooms(): Promise<ChatRoom[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from(TABLES.chatRooms)
    .select(`*, restaurant:restaurants(id, name)`)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as ChatRoom[]) ?? [];
}
