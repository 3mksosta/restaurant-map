import { NextRequest, NextResponse } from 'next/server';
import { getRoomMessages } from '@/lib/services/chatService';

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  try {
    const data = await getRoomMessages(Number(roomId));
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
