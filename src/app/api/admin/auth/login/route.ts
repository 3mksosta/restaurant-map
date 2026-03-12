import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/services/adminService';
import { signToken } from '@/lib/adminAuth';
import { JWT_COOKIE_NAME } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const admin = await verifyAdmin(username, password);
    if (!admin) return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });

    const token = await signToken({ id: admin.id, username: admin.username, role: admin.role });

    const res = NextResponse.json({ success: true, role: admin.role });
    res.cookies.set(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: '/',
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
