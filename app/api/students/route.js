import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Student from '../../../lib/models/Student.js';
import { getSession } from '@/lib/auth';

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

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'studentId'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId: data.studentId });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this ID already exists' },
        { status: 400 }
      );
    }

    // Create new student
    const student = await Student.create({
      studentId: data.studentId,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
} 