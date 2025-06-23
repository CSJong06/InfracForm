import { NextResponse } from 'next/server'; // Import Next.js response handler for API routes
import connectDB from '../../../../lib/mongodb.js'; // Import database connection utility
import User from '../../../../lib/models/User.js'; // Import User model for database operations
import jwt from 'jsonwebtoken'; // Import JWT for creating authentication tokens
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing and comparison
import { cookies } from 'next/headers'; // Import Next.js cookies API for setting authentication cookies

export async function POST(request) { // Handle POST requests for user login
  try {
    const { email, password } = await request.json(); // Extract email and password from request body
    await connectDB(); // Establish connection to MongoDB database

    // Validate input
    if (!email || !password) { // Check if both email and password are provided
      return NextResponse.json(
        { error: 'Email and password are required' }, // Return error message for missing credentials
        { status: 400 } // Return 400 Bad Request status code
      );
    }

    // Find user
    const user = await User.findOne({ email }); // Search for user in database by email address
    
    if (!user) { // Check if user exists in database
      return NextResponse.json(
        { error: 'Invalid email or password' }, // Return generic error message for security (don't reveal if email exists)
        { status: 401 } // Return 401 Unauthorized status code
      );
    }

    // Check if user is active
    if (!user.isActive) { // Check if user account is active (not deactivated)
      return NextResponse.json(
        { error: 'Account is deactivated' }, // Return specific error for deactivated accounts
        { status: 401 } // Return 401 Unauthorized status code
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password); // Compare provided password with hashed password in database
    
    if (!isValidPassword) { // Check if password matches the stored hash
      return NextResponse.json(
        { error: 'Invalid email or password' }, // Return generic error message for security
        { status: 401 } // Return 401 Unauthorized status code
      );
    }

    // Create JWT token
    const token = jwt.sign( // Sign a new JWT token with user data
      { 
        userId: user._id, // Include user ID in token payload
        email: user.email, // Include email in token payload
        isAdmin: user.isAdmin // Include admin status in token payload
      },
      process.env.JWT_SECRET || 'your-secret-key', // Use environment variable for secret key or fallback
      { expiresIn: '24h' } // Set token expiration to 24 hours
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({ // Create JSON response with user data
      user: {
        id: user._id, // Return user ID
        email: user.email, // Return user email
        firstName: user.firstName, // Return user first name
        lastName: user.lastName, // Return user last name
        isAdmin: user.isAdmin // Return admin status
      }
    });

    response.cookies.set('token', token, { // Set JWT token as HTTP-only cookie
      httpOnly: true, // Prevent JavaScript access to cookie for security
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      sameSite: 'strict', // Prevent CSRF attacks by restricting cookie to same site
      maxAge: 60 * 60 * 24 // Set cookie expiration to 24 hours (in seconds)
    });

    return response; // Return the response with user data and authentication cookie
  } catch (error) { // Catch any errors that occur during login process
    console.error('Login error:', error); // Log the error to console for debugging
    return NextResponse.json(
      { error: 'Internal server error' }, // Return generic error message to client for security
      { status: 500 } // Return 500 Internal Server Error status code
    );
  }
} 