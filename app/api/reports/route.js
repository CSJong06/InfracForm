import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Report, { handleIndexes } from '../../../lib/models/Report.js';

// GET all reports with optional status filter
export async function GET(request) {
  try {
    await connectDB();
    await handleIndexes();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const query = status ? { status } : {};
    
    const reports = await Report.find(query)
      .sort({ entryTimestamp: -1 })
      .limit(100);
      
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports', details: error.message },
      { status: 500 }
    );
  }
}

// POST new report
export async function POST(request) {
  try {
    await connectDB();
    await handleIndexes();
    const data = await request.json();
    
    console.log('Received report data:', data); // Debug log
    
    // Validate required fields
    const requiredFields = ['studentNumber', 'submitterEmail', 'interaction', 'interactionTimestamp'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate infraction-specific fields
    if (data.interaction === 'INFRACTION') {
      if (!data.infraction) {
        return NextResponse.json(
          { error: 'Infraction type is required for infraction reports' },
          { status: 400 }
        );
      }
      if (!data.intervention) {
        return NextResponse.json(
          { error: 'Intervention is required for infraction reports' },
          { status: 400 }
        );
      }
    } else {
      // Set default values for non-infraction reports
      data.infraction = 'NONE';
      data.intervention = 'NONE';
    }

    // Set default status if not provided
    if (!data.status) {
      data.status = 'UNRESOLVED';
    }

    // Ensure studentNumber is a string
    if (typeof data.studentNumber === 'number') {
      data.studentNumber = data.studentNumber.toString().padStart(6, '0');
    } else if (typeof data.studentNumber === 'string') {
      data.studentNumber = data.studentNumber.padStart(6, '0');
    }

    // Ensure intervention is a string
    if (Array.isArray(data.intervention)) {
      data.intervention = data.intervention.join(',');
    }

    console.log('Processed report data:', data); // Debug log

    // Get next interactionID and create report
    const nextID = await Report.getNextInteractionID();
    const report = new Report({
      ...data,
      interactionID: nextID,
      editUrl: `/reports/${nextID}/edit`
    });
    await report.save();
    
    return NextResponse.json(report, { status: 201 });
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