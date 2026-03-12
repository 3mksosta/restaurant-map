import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRoom } from '@/lib/services/chatService';

export async function POST(req: NextRequest) {
  try {
    const { restaurantId, sessionId, customerName } = await req.json();
    const data = await getOrCreateRoom(Number(restaurantId), sessionId, customerName);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
