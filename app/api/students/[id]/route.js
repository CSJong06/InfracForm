import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import Student from '../../../../lib/models/Student.js';
import { getSession } from '@/lib/auth';

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

// DELETE student
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    
    const student = await Student.findOne({ studentId: id });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    await student.deleteOne();
    
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/students/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
} 