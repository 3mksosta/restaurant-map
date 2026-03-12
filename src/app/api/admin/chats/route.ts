import { NextRequest, NextResponse } from 'next/server';
import { getAllRooms, getRoomMessages, sendMessage } from '@/lib/services/chatService';
import { getSession } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const roomId = req.nextUrl.searchParams.get('roomId');
  try {
    if (roomId) {
      const data = await getRoomMessages(Number(roomId));
      return NextResponse.json({ data });
    }
    const data = await getAllRooms();
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { roomId, content } = await req.json();
    const data = await sendMessage(Number(roomId), 'admin', content);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
