import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Student from '../../../../lib/models/Student.js';

// GET single student
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findOne({ studentId: id });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(student);
  } catch (error) {
    console.error('Error in GET /api/students/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
} 