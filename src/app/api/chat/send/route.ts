import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/services/chatService';

export async function POST(req: NextRequest) {
  try {
    const { roomId, sender, content } = await req.json();
    const data = await sendMessage(Number(roomId), sender, content);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
