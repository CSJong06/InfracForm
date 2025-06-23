import { NextResponse } from 'next/server'; // Import Next.js response handler for API routes
import connectDB from '@/lib/mongodb'; // Import database connection utility
import Report from '@/lib/models/Report'; // Import Report model for database operations

// Map interaction types to their codes
const interactionTypeToCode = { // Mapping object to convert interaction type names to short codes
  'SHOUT_OUT': 'S', // Map shout-out to 'S'
  'CHECK_IN_WITH_GUARDIAN': 'CG', // Map guardian check-in to 'CG'
  'CHECK_IN_WITH_STUDENT': 'CS', // Map student check-in to 'CS'
  'ATTENDANCE_TRACKING': 'AT', // Map attendance tracking to 'AT'
  'PARENT_LIAISON_CHECK_IN': 'PLCI', // Map parent liaison check-in to 'PLCI'
  'BSS_CHECK_IN': 'BSSC', // Map BSS check-in to 'BSSC'
  'ADVISORY_ONE_ON_ONE_CONFERENCE': 'AOOC', // Map advisory conference to 'AOOC'
  'ADVISORY_CHECK_IN_WITH_GUARDIAN': 'ACG', // Map advisory guardian check-in to 'ACG'
  'INFRACTION': 'I', // Map infraction to 'I'
  'INFORMATION_SHARING': 'IS', // Map information sharing to 'IS'
  'DELETED_LOG': 'D', // Map deleted log to 'D'
  'ADMIN_CHECK_IN': 'ACI', // Map admin check-in to 'ACI'
  'STUDENT_OF_THE_MONTH': 'SM', // Map student of month to 'SM'
  'COUNSELOR_CHECK_IN': 'CC', // Map counselor check-in to 'CC'
  'STUDIO_ONE_ON_ONE_CONFERENCE': 'SOOC', // Map studio conference to 'SOOC'
  'TWENTY_FIRST_CENTURY_CHECK_IN': '21CCI' // Map 21st century check-in to '21CCI'
};

// Format date to YYYYMMDDHHMMSS
const formatDate = (date) => { // Function to format date to specific CSV format
  const d = new Date(date); // Convert input to Date object
  return d.getFullYear().toString() + // Get full year as string
    (d.getMonth() + 1).toString().padStart(2, '0') + // Get month (1-indexed) with leading zero
    d.getDate().toString().padStart(2, '0') + // Get day with leading zero
    d.getHours().toString().padStart(2, '0') + // Get hours with leading zero
    d.getMinutes().toString().padStart(2, '0') + // Get minutes with leading zero
    d.getSeconds().toString().padStart(2, '0'); // Get seconds with leading zero
};

export async function GET() { // Handle GET requests for CSV export
  try {
    await connectDB(); // Establish connection to MongoDB database
    
    // Fetch all reports
    const reports = await Report.find() // Query all reports from database
      .sort({ interactionTimestamp: -1 }); // Sort by interaction timestamp descending (newest first)

    // Convert reports to CSV format
    const headers = [ // Define CSV column headers
      'studentnumber', // Student ID column
      'entrytimestamp', // When report was entered
      'submitteremail', // Email of person who submitted report
      'interactioncode', // Short code for interaction type
      'responses', // Intervention responses (if any)
      'notes', // General notes about the interaction
      'interactiontimestamp', // When the interaction occurred
      'editurl', // URL to edit this report
      'entryidentifier', // Unique identifier for the entry
      'interactionid' // Unique identifier for the interaction
    ];

    const rows = reports.map(report => [ // Transform each report into CSV row array
      report.studentNumber || '', // Student number or empty string
      formatDate(report.entryTimestamp), // Format entry timestamp
      report.submitterEmail || '', // Submitter email or empty string
      interactionTypeToCode[report.interaction] || report.interaction || '', // Convert interaction to code or use original
      report.intervention === 'NONE' ? '' : (report.intervention || ''), // Only include non-NONE interventions
      (report.notes || '').replace(/"/g, '""'), // Escape quotes in notes for CSV format
      formatDate(report.interactionTimestamp), // Format interaction timestamp
      `/reports/${report.interactionID}/edit`, // Generate edit URL
      report.interactionID, // Use interaction ID as entry identifier
      report.interactionID // Use interaction ID as interaction identifier
    ]);

    // Create CSV content
    const csvContent = [ // Build CSV content array
      headers.join(','), // Join headers with commas for first row
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // Quote each cell and join rows with commas
    ].join('\n'); // Join all rows with newlines

    // Return CSV file
    return new NextResponse(csvContent, { // Return CSV content as response
      headers: { // Set response headers for file download
        'Content-Type': 'text/csv', // Specify content type as CSV
        'Content-Disposition': `attachment; filename="reports-${new Date().toISOString().split('T')[0]}.csv"` // Set filename with current date
      }
    });
  } catch (error) { // Catch any errors during export process
    console.error('Export error:', error); // Log error for debugging
    return NextResponse.json( // Return error response
      { error: 'Failed to export reports' }, // Generic error message for security
      { status: 500 } // Return 500 Internal Server Error status code
    );
  }
} 