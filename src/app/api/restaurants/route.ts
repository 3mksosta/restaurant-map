import { NextRequest, NextResponse } from 'next/server';
import { getRestaurants, createRestaurant } from '@/lib/services/restaurantService';
import { getSession } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categoryId = searchParams.get('category');
  try {
    const data = await getRestaurants(categoryId ? Number(categoryId) : undefined);
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
    const data = await createRestaurant(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
