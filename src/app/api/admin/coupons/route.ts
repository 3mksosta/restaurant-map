import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/adminAuth';
import { TABLES } from '@/lib/constants';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from(TABLES.coupons)
      .select(`*, restaurant:restaurants(id, name)`)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const sb = createServerClient();
    const { data, error } = await sb.from(TABLES.coupons).insert([body]).select().single();
    if (error) throw new Error(error.message);
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
    const sb = createServerClient();
    const { data, error } = await sb.from(TABLES.coupons).update(rest).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === 'viewer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { id } = await req.json();
    const sb = createServerClient();
    await sb.from(TABLES.coupons).delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
