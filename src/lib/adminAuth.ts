// =============================================
// Admin Auth — SERVER ONLY (API routes)
// =============================================
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AdminSession } from '@/types';
import { JWT_COOKIE_NAME, JWT_EXPIRES_IN } from '@/lib/constants';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'mataem-map-secret-key-change-in-prod'
);

export async function signToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

/** استخدم في API routes فقط */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** التحقق من صلاحية معينة */
export async function requireRole(
  minRole: 'viewer' | 'manager' | 'super'
): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const roles = ['viewer', 'manager', 'super'];
  if (roles.indexOf(session.role) < roles.indexOf(minRole)) {
    throw new Error('Forbidden');
  }
  return session;
}
