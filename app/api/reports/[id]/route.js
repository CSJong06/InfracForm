import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Report from '../../../../lib/models/Report.js';

// GET single report
export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const report = await Report.findOne({ interactionID: id });
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// PATCH update report
export async function PATCH(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const data = await request.json();
    
    // Validate status if provided
    if (data.status && !['RESOLVED', 'UNRESOLVED'].includes(data.status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Convert status to uppercase if provided
    if (data.status) {
      data.status = data.status.toUpperCase();
    }
    
    const report = await Report.findOneAndUpdate(
      { interactionID: id },
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// DELETE report
export async function DELETE(request, context) {
  try {
    await connectDB();
    const { id } = context.params;
    
    const deletedReport = await Report.findOneAndDelete({ interactionID: id });
    
    if (!deletedReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Report deleted successfully',
      deletedReport 
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
} 