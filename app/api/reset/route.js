import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Student from '../../../lib/models/Student.js';
import Report from '../../../lib/models/Report.js';

export async function POST() {
  try {
    await connectDB();
    
    // Clear all collections
    await Student.deleteMany({});
    await Report.deleteMany({});

    return NextResponse.json({ 
      message: 'Database reset successfully',
      cleared: {
        students: true,
        reports: true
      }
    });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    );
  }
} 