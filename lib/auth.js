import { cookies } from 'next/headers'; // Import Next.js cookies utility for server-side cookie access
import { jwtVerify } from 'jose'; // Import JWT verification function from jose library

export async function getSession() { // Function to retrieve and validate user session from cookies
  const cookieStore = await cookies(); // Get the cookie store from Next.js headers
  const token = cookieStore.get('token')?.value; // Extract the JWT token from the 'token' cookie

  if (!token) { // Check if no token exists in cookies
    return null; // Return null if no token is found
  }

  try {
    const secret = new TextEncoder().encode( // Convert JWT secret to Uint8Array for verification
      process.env.JWT_SECRET || 'your-secret-key' // Use environment variable or fallback secret
    );
    const { payload } = await jwtVerify(token, secret); // Verify the JWT token and extract payload
    return payload; // Return the decoded JWT payload containing user information
  } catch (error) { // Catch any JWT verification errors
    return null; // Return null if token is invalid or expired
  }
}

export async function isAuthenticated() { // Function to check if user is authenticated
  const session = await getSession(); // Get the current user session
  return !!session; // Return true if session exists, false otherwise
}

export async function isAdmin() { // Function to check if user has admin privileges
  const session = await getSession(); // Get the current user session
  return session?.isAdmin || false; // Return true if user is admin, false otherwise
}

export async function requireAuth() { // Function to require authentication or throw error
  const session = await getSession(); // Get the current user session
  if (!session) { // Check if no session exists
    throw new Error('Authentication required'); // Throw error if user is not authenticated
  }
  return session; // Return the session if user is authenticated
}

export async function requireAdmin() { // Function to require admin privileges or throw error
  const session = await getSession(); // Get the current user session
  if (!session?.isAdmin) { // Check if user is not an admin
    throw new Error('Admin access required'); // Throw error if user lacks admin privileges
  }
  return session; // Return the session if user is an admin
} 