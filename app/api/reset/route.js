import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Report from '../../../lib/models/Report.js';

export async function POST() {
  try {
    await connectDB();
    
    // Clear only reports collection
    await Report.deleteMany({});

    return NextResponse.json({ 
      message: 'Reports cleared successfully',
      cleared: {
        reports: true
      }
    });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json(
      { error: 'Failed to clear reports' },
      { status: 500 }
    );
  }
} 