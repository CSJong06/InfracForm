import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// List of public paths that don't require authentication
const publicPaths = ['/', '/api/auth/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for token in cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Redirect to root (login page) if no token is present
    const url = new URL('/', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    await jwtVerify(token, secret);

    // For admin-only routes
    if (pathname.startsWith('/admin')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to root (login page)
    const url = new URL('/', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 