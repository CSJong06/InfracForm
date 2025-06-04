import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import connectDB from '../../../../lib/mongodb.js';
import Student from '../../../../lib/models/Student.js';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const text = await file.text();
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validate CSV structure
    const requiredColumns = ['studentnumber', 'firstname', 'lastname'];
    const firstRecord = records[0];
    if (!firstRecord || !requiredColumns.every(col => col in firstRecord)) {
      return NextResponse.json(
        { error: 'Invalid CSV format. Required columns: studentnumber, firstname, lastname' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Process records
    const imported = [];
    const errors = [];

    for (const record of records) {
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ studentId: record.studentnumber });
        if (existingStudent) {
          errors.push(`Student ${record.studentnumber} already exists`);
          continue;
        }

        // Create new student
        const student = await Student.create({
          studentId: record.studentnumber,
          firstName: record.firstname,
          lastName: record.lastname,
        });

        imported.push(student);
      } catch (err) {
        errors.push(`Error importing student ${record.studentnumber}: ${err.message}`);
      }
    }

    return NextResponse.json({
      imported: imported.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    );
  }
} 