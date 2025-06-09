import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Student from '../../../../lib/models/Student.js';

export async function POST(request) {
  try {
    await connectDB();
    const { studentNumbers } = await request.json();

    if (!Array.isArray(studentNumbers)) {
      return NextResponse.json(
        { error: 'studentNumbers must be an array' },
        { status: 400 }
      );
    }

    const students = await Student.find({
      studentId: { $in: studentNumbers }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error in POST /api/students/bulk:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students', details: error.message },
      { status: 500 }
    );
  }
} 