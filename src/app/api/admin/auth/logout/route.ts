import { NextResponse } from 'next/server';
import { JWT_COOKIE_NAME } from '@/lib/constants';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(JWT_COOKIE_NAME);
  return res;
}
