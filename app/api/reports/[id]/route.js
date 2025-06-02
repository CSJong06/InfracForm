import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Report from '../../../../lib/models/Report.js';

// GET single report
export async function GET(request, { params }) {
  try {
    await connectDB();
    const report = await Report.findById(params.id);
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// PATCH update report status
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Only allow status updates
    if (!data.status || !['RESOLVED', 'UNRESOLVED'].includes(data.status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const report = await Report.findByIdAndUpdate(
      params.id,
      { status: data.status.toUpperCase() },
      { new: true }
    );
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 