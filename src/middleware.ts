import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_COOKIE_NAME } from '@/lib/constants';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'mataem-map-secret-key-change-in-prod'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // حماية لوحة الإدارة فقط (ليس صفحة الدخول)
  const isProtected =
    pathname.startsWith('/DFG/dashboard') ||
    (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth'));

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/DFG', req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/DFG', req.url));
    response.cookies.delete(JWT_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/DFG/dashboard/:path*', '/api/admin/:path*'],
};
