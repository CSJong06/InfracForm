import { NextResponse } from 'next/server'; // Import Next.js response helper for middleware
import { jwtVerify } from 'jose'; // Import JWT verification function

// List of public paths that don't require authentication
const publicPaths = ['/', '/api/auth/login']; // Define paths that don't need authentication

// List of admin-only paths
const adminPaths = ['/admin', '/form-editor']; // Define paths that require admin privileges

export async function middleware(request) { // Middleware function that runs on every request
  const { pathname } = request.nextUrl; // Extract the pathname from the request URL

  // Allow public paths
  if (publicPaths.includes(pathname)) { // Check if the current path is public
    return NextResponse.next(); // Allow the request to continue without authentication
  }

  // Check for token in cookies
  const token = request.cookies.get('token')?.value; // Extract JWT token from cookies

  if (!token) { // Check if no token exists
    // Redirect to root (login page) if no token is present
    const url = new URL('/', request.url); // Create redirect URL to login page
    url.searchParams.set('from', pathname); // Add current path as 'from' parameter
    return NextResponse.redirect(url); // Redirect to login page
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode( // Convert JWT secret string to Uint8Array for jose library
      process.env.JWT_SECRET || 'your-secret-key' // Use environment variable for secret or fallback to default
    );
    await jwtVerify(token, secret); // Verify JWT token signature and expiration using jose library

    // For admin-only routes
    if (adminPaths.some(path => pathname.startsWith(path))) { // Check if current path requires admin privileges
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload by splitting token and base64 decoding
      if (!payload.isAdmin) { // Check if user does not have admin privileges in token payload
        return NextResponse.redirect(new URL('/dashboard', request.url)); // Redirect non-admin users to dashboard instead of admin pages
      }
    }

    return NextResponse.next(); // Allow authenticated request to continue to the target page
  } catch (error) { // Catch any JWT verification errors (invalid signature, expired token, etc.)
    // Invalid token, redirect to root (login page)
    const url = new URL('/', request.url); // Create redirect URL to login page
    url.searchParams.set('from', pathname); // Add current path as 'from' parameter for post-login redirect
    return NextResponse.redirect(url); // Redirect user to login page due to invalid authentication
  }
}

// Configure which paths the middleware should run on
export const config = { // Export middleware configuration
  matcher: [ // Define which paths the middleware should process
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)', // Regex to match all paths except static assets
  ],
}; 