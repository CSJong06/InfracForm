import { NextResponse } from 'next/server'; // Import Next.js response helper for API routes
import connectDB from '../../../lib/mongodb.js'; // Import database connection utility
import Report, { handleIndexes } from '../../../lib/models/Report.js'; // Import Report model and index handler
import InteractionType from '../../../lib/models/InteractionType.js'; // Import InteractionType model for validation

// GET all reports with optional status filter
export async function GET(request) { // Handle GET requests to fetch reports
  try {
    await connectDB(); // Ensure database connection is established
    await handleIndexes(); // Ensure indexes are set up for the Report collection
    const { searchParams } = new URL(request.url); // Parse query parameters from the request URL
    const status = searchParams.get('status'); // Get the 'status' filter from query params
    
    const query = status ? { status } : {}; // Build query object based on status filter
    
    const reports = await Report.find(query) // Query the database for reports
      .sort({ entryTimestamp: -1 }) // Sort results by entryTimestamp descending
      .limit(100); // Limit results to 100 reports
      
    return NextResponse.json(reports); // Return the reports as a JSON response
  } catch (error) {
    console.error('Error in GET /api/reports:', error); // Log any errors
    return NextResponse.json(
      { error: 'Failed to fetch reports', details: error.message }, // Return error details
      { status: 500 }
    );
  }
}

// POST new report
export async function POST(request) { // Handle POST requests to create a new report
  try {
    await connectDB(); // Ensure database connection is established
    await handleIndexes(); // Ensure indexes are set up for the Report collection
    const data = await request.json(); // Parse the request body as JSON
    
    // Validate required fields
    const requiredFields = ['studentNumber', 'submitterEmail', 'interaction', 'interactionTimestamp']; // List of required fields for a report
    const missingFields = requiredFields.filter(field => !data[field]); // Find any missing required fields
    
    if (missingFields.length > 0) { // If any required fields are missing
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` }, // Return error with missing fields
        { status: 400 }
      );
    }

    // Validate interaction type exists in database
    const interactionType = await InteractionType.findOne({ name: data.interaction }); // Check if the provided interaction type exists
    if (!interactionType) { // If the interaction type is invalid
      return NextResponse.json(
        { error: `Invalid interaction type: ${data.interaction}` }, // Return error for invalid interaction type
        { status: 400 }
      );
    }

    // Validate infraction-specific fields
    if (data.interaction === 'INFRACTION') { // Check if the interaction type is specifically an infraction
      if (!data.infraction) { // Validate that infraction type is provided for infraction reports
        return NextResponse.json(
          { error: 'Infraction type is required for infraction reports' }, // Return specific error for missing infraction type
          { status: 400 } // Return 400 Bad Request status code
        );
      }
    } else {
      // Set default values for non-infraction reports
      data.infraction = 'NONE'; // Set infraction to 'NONE' for non-infraction interactions (shout-outs, check-ins)
    }

    // Set default intervention if not provided
    if (!data.intervention) { // Check if intervention field is missing
      data.intervention = 'NONE'; // Set default intervention to 'NONE' for reports without specific intervention
    }

    // Set default status if not provided
    if (!data.status) { // Check if status field is missing
      data.status = 'UNRESOLVED'; // Set default status to 'UNRESOLVED' for new reports
    }

    // Ensure studentNumber is a string
    if (typeof data.studentNumber === 'number') { // Check if student number is provided as a number
      data.studentNumber = data.studentNumber.toString().padStart(6, '0'); // Convert to string and pad with leading zeros to 6 digits
    } else if (typeof data.studentNumber === 'string') { // Check if student number is already a string
      data.studentNumber = data.studentNumber.padStart(6, '0'); // Pad string with leading zeros to ensure 6-digit format
    }

    // Ensure intervention is a string
    if (Array.isArray(data.intervention)) { // Check if intervention is provided as an array
      data.intervention = data.intervention.join(','); // Convert array to comma-separated string for database storage
    }

    // Set interactioncode to match interaction
    data.interactioncode = data.interaction; // Ensure interactioncode field matches the interaction type for consistency

    // Get next interactionID and create report
    const nextID = await Report.getNextInteractionID(); // Get the next available interaction ID from the database
    const report = new Report({ // Create new Report instance with processed data
      ...data, // Spread all processed data fields
      interactionID: nextID, // Assign the generated interaction ID
      editUrl: `/reports/${nextID}/edit` // Generate edit URL using the interaction ID
    });
    await report.save(); // Save the new report to the database
    
    return NextResponse.json(report, { status: 201 }); // Return the created report with 201 Created status code
  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create report', 
        details: error.message,
        code: error.code,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      },
      { status: 500 }
    );
  }
} 