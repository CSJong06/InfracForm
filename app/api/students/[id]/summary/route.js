import { NextResponse } from 'next/server'; // Import Next.js response handler for API routes
import connectDB from '../../../../../lib/mongodb.js'; // Import database connection utility
import Student from '../../../../../lib/models/Student.js'; // Import Student model for database operations
import Report from '../../../../../lib/models/Report.js'; // Import Report model for database operations

export async function GET(request, { params }) { // Handle GET requests for student summary data
  try {
    await connectDB(); // Establish connection to MongoDB database
    const { id } = await params; // Extract student ID from URL parameters
    const student = await Student.findOne({ studentId: id }); // Find student by student ID
    if (!student) { // Check if student exists in database
      return NextResponse.json({ error: 'Student not found' }, { status: 404 }); // Return 404 if student not found
    }
    const reports = await Report.find({ studentNumber: id }); // Find all reports for this student
    console.log('Fetched Reports:', reports); // Debug log to show fetched reports
    const infractions = reports.filter(report => report.interaction === 'INFRACTION'); // Filter reports to only infractions
    console.log('Infractions:', infractions); // Debug log to show filtered infractions
    const infractionTypes = [...new Set(infractions.map(report => report.infraction).filter(type => type !== 'NONE'))]; // Get unique infraction types excluding 'NONE'
    console.log('Infraction Types:', infractionTypes); // Debug log to show unique infraction types
    return NextResponse.json({ // Return student summary data as JSON
      studentName: `${student.firstName} ${student.lastName}`, // Combine first and last name for display
      totalReports: reports.length, // Total number of reports for this student
      infractionCount: infractions.length, // Number of infraction reports
      infractionTypes: infractionTypes.length > 0 ? infractionTypes : [], // Array of unique infraction types or empty array
      message: reports.length === 0 ? 'No reports found for this student.' : infractions.length === 0 ? 'No infractions recorded for this student.' : null // Contextual message based on data
    });
  } catch (error) { // Catch any errors during summary generation
    console.error('Error fetching student summary:', error); // Log error for debugging
    return NextResponse.json({ error: 'Failed to fetch student summary' }, { status: 500 }); // Return 500 Internal Server Error
  }
} 