import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Student from '../../../lib/models/Student.js';

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find({}).sort({ lastName: 1, firstName: 1 });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
} 