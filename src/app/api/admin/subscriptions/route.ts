import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscriptions, createSubscription, updateSubscription,
  getExpiringSoon, deactivateExpiredSubscriptions
} from '@/lib/services/subscriptionService';
import { getSession } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const action = req.nextUrl.searchParams.get('action');
  try {
    if (action === 'expiring') {
      const data = await getExpiringSoon(3);
      return NextResponse.json({ data });
    }
    if (action === 'deactivate-expired') {
      await deactivateExpiredSubscriptions();
      return NextResponse.json({ success: true });
    }
    const data = await getSubscriptions();
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = await createSubscription(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, ...rest } = await req.json();
    const data = await updateSubscription(Number(id), rest);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
