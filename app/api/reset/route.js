import { NextResponse } from 'next/server'; // Import Next.js response handler for API routes
import connectDB from '../../../lib/mongodb.js'; // Import database connection utility
import Report from '../../../lib/models/Report.js'; // Import Report model for database operations

export async function POST() { // Handle POST requests for database reset (clearing reports)
  try {
    await connectDB(); // Establish connection to MongoDB database
    
    // Clear only reports collection
    await Report.deleteMany({}); // Delete all documents from the reports collection

    return NextResponse.json({ // Return success response
      message: 'Reports cleared successfully', // Success message for user feedback
      cleared: { // Object indicating what was cleared
        reports: true // Flag indicating reports were successfully cleared
      }
    });
  } catch (error) { // Catch any errors during database reset
    console.error('Database reset error:', error); // Log error for debugging
    return NextResponse.json( // Return error response
      { error: 'Failed to clear reports' }, // Generic error message for security
      { status: 500 } // Return 500 Internal Server Error status code
    );
  }
} 