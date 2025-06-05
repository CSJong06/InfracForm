import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

export async function isAdmin() {
  const session = await getSession();
  return session?.isAdmin || false;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) {
    throw new Error('Admin access required');
  }
  return session;
} 