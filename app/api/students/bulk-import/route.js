import { NextResponse } from 'next/server'; // Import Next.js response handler for API routes
import { parse } from 'csv-parse/sync'; // Import CSV parser for synchronous file processing
import connectDB from '../../../../lib/mongodb.js'; // Import database connection utility
import Student from '../../../../lib/models/Student.js'; // Import Student model for database operations

export async function POST(request) { // Handle POST requests for bulk student import
  try {
    const formData = await request.formData(); // Parse multipart form data from request
    const file = formData.get('file'); // Extract uploaded file from form data

    if (!file) { // Check if file was provided in the request
      return NextResponse.json(
        { error: 'No file provided' }, // Return error message for missing file
        { status: 400 } // Return 400 Bad Request status code
      );
    }

    // Read and parse CSV file
    const text = await file.text(); // Convert uploaded file to text string
    const records = parse(text, { // Parse CSV text into array of objects
      columns: true, // Use first row as column headers
      skip_empty_lines: true, // Ignore empty lines in CSV
      trim: true, // Remove whitespace from field values
    });

    // Validate CSV structure
    const requiredColumns = ['studentnumber', 'firstname', 'lastname']; // Define required column names for CSV validation
    const firstRecord = records[0]; // Get first record to check column structure
    if (!firstRecord || !requiredColumns.every(col => col in firstRecord)) { // Check if all required columns exist
      return NextResponse.json(
        { error: 'Invalid CSV format. Required columns: studentnumber, firstname, lastname' }, // Return detailed error message
        { status: 400 } // Return 400 Bad Request status code
      );
    }

    // Connect to database
    await connectDB(); // Establish connection to MongoDB database

    // Process records
    const imported = []; // Array to track successfully imported students
    const errors = []; // Array to track import errors for reporting

    for (const record of records) { // Iterate through each CSV record for processing
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ studentId: record.studentnumber }); // Search for existing student by ID
        if (existingStudent) { // Check if student already exists in database
          errors.push(`Student ${record.studentnumber} already exists`); // Add duplicate error to errors array
          continue; // Skip to next record without creating duplicate
        }

        // Create new student
        const student = await Student.create({ // Create new student record in database
          studentId: record.studentnumber, // Map CSV studentnumber to database studentId
          firstName: record.firstname, // Map CSV firstname to database firstName
          lastName: record.lastname, // Map CSV lastname to database lastName
        });

        imported.push(student); // Add successfully created student to imported array
      } catch (err) { // Catch any errors during individual student creation
        errors.push(`Error importing student ${record.studentnumber}: ${err.message}`); // Add detailed error message to errors array
      }
    }

    return NextResponse.json({ // Return import results to client
      imported: imported.length, // Return count of successfully imported students
      errors: errors.length > 0 ? errors : undefined, // Return errors array only if errors occurred
    });
  } catch (error) { // Catch any errors that occur during bulk import process
    console.error('Bulk import error:', error); // Log the error for debugging
    return NextResponse.json(
      { error: 'Failed to process CSV file' }, // Return generic error message to client
      { status: 500 } // Return 500 Internal Server Error status code
    );
  }
} 