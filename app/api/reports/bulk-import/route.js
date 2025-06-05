import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import connectDB from '../../../../lib/mongodb.js';
import Report from '../../../../lib/models/Report.js';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    console.log('Starting bulk import process...');
    
    const session = await getSession();
    if (!session?.isAdmin) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      console.log('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Read and parse CSV file
    const text = await file.text();
    console.log('CSV content length:', text.length);
    
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log('Parsed records:', {
      count: records.length,
      firstRecord: records[0],
      headers: Object.keys(records[0] || {})
    });

    // Validate CSV structure
    const requiredColumns = [
      'studentnumber',
      'entrytimestamp',
      'submitteremail',
      'interactioncode',
      'responses',
      'notes',
      'interactiontimestamp',
      'entryidentifier',
      'interactionid'
    ];

    const firstRecord = records[0];
    if (!firstRecord) {
      console.log('No records found in CSV');
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Check for required columns while ignoring editurl and referraltype
    const missingColumns = requiredColumns.filter(col => !(col in firstRecord));
    if (missingColumns.length > 0) {
      console.log('Missing required columns:', missingColumns);
      return NextResponse.json(
        { 
          error: 'Invalid CSV format',
          details: {
            missingColumns,
            foundColumns: Object.keys(firstRecord).filter(col => 
              col !== 'editurl' && col !== 'referraltype'
            )
          }
        },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database');

    // Process records
    const imported = [];
    const errors = [];

    const interactionTypes = {
      'IS': 'Information Sharing',
      'PLCI': 'Parent Liaison Check-In',
      '21CCI': '21st Century Check-In',
      'ACI': 'Admin Check-In',
      'SM': 'Student of the Month',
      'ACG': 'Advisory Check-in with Guardian',
      'CG': 'Check-in with Guardian',
      'CC': 'Counselor Check-in',
      'SOOC': 'Studio One-on-One Conference',
      'BSSC': 'BSS Check-in',
      'AOOC': 'Advisory One-on-One Conference',
      'D': 'Deleted log',
      'I': 'Infraction',
      'AT': 'Attendance Tracking',
      'CS': 'Check-in with Student',
      'S': 'Shout-out'
    };

    const interventionTypes = {
      'NONE': 'NONE',
      'VERBAL_WARNING': 'VERBAL_WARNING',
      'WRITTEN_WARNING': 'WRITTEN_WARNING',
      'PARENT_CONTACT': 'PARENT_CONTACT',
      'ADMINISTRATIVE': 'ADMINISTRATIVE',
      'Emailed parent or guardian': 'PARENT_CONTACT',
      'Called home: Spoke with parent/guardian': 'PARENT_CONTACT',
      'Called home: Left message': 'PARENT_CONTACT',
      'Called home: No answer': 'PARENT_CONTACT',
      'Called home: Disconnected': 'PARENT_CONTACT',
      'Parent meeting': 'PARENT_CONTACT',
      'Group restorative circle': 'ADMINISTRATIVE',
      'Door Conversations': 'VERBAL_WARNING',
      'Check-In': 'VERBAL_WARNING',
      'Teacher Strategy (describe in notes)': 'VERBAL_WARNING'
    };

    for (const [index, record] of records.entries()) {
      try {
        console.log(`Processing record ${index + 1}/${records.length}`);
        
        // Convert timestamps to Date objects
        let entryTimestamp, interactionTimestamp;
        try {
          // Parse dates in format YYYYMMDDHHMMSS
          const parseDate = (dateStr) => {
            if (!dateStr) return null;
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const hour = dateStr.substring(8, 10);
            const minute = dateStr.substring(10, 12);
            const second = dateStr.substring(12, 14);
            return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
          };

          entryTimestamp = parseDate(record.entrytimestamp);
          interactionTimestamp = parseDate(record.interactiontimestamp);

          if (!entryTimestamp || !interactionTimestamp || isNaN(entryTimestamp.getTime()) || isNaN(interactionTimestamp.getTime())) {
            throw new Error('Invalid timestamp format');
          }
        } catch (err) {
          throw new Error(`Invalid timestamp format: ${err.message}`);
        }

        // Create new report, ignoring editurl and referraltype
        const report = new Report({
          studentNumber: record.studentnumber,
          entryTimestamp,
          submitterEmail: record.submitteremail,
          interaction: interactionTypes[record.interactioncode] || record.interaction,
          interactioncode: record.interactioncode,
          infraction: record.interactioncode === 'I' ? 
            (record.responses === 'Door Conversations' ? 'FAILURE_TO_MEET_EXPECTATIONS' :
             record.responses === 'Teacher Strategy (describe in notes)' ? 'FAILURE_TO_MEET_EXPECTATIONS' :
             record.responses === 'Called home: Spoke with parent/guardian' ? 'NONE' :
             record.responses === 'Called home: Left message' ? 'NONE' :
             record.responses === 'Called home: No answer' ? 'NONE' :
             record.responses === 'Called home: Disconnected' ? 'NONE' :
             record.responses === 'Parent meeting' ? 'NONE' :
             record.responses === 'Group restorative circle' ? 'NONE' :
             record.responses === 'Check-In' ? 'NONE' :
             ['CUT_CLASS', 'IMPROPER_LANGUAGE', 'FAILURE_TO_MEET_EXPECTATIONS', 'CELLPHONE', 
              'LEAVING_WITHOUT_PERMISSION', 'MISUSE_OF_HALLPASS', 'TARDINESS', 'MINOR_VANDALISM', 'NONE'].includes(record.responses) ? 
              record.responses : 'NONE') : 
            'NONE',
          intervention: record.interactioncode === 'I' ? 
            (interventionTypes[record.responses] || 'NONE') : 
            'NONE',
          notes: record.notes,
          interactionTimestamp,
          interactionID: record.interactionid || `${record.studentnumber}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          editUrl: record.editurl,
          status: 'UNRESOLVED'
        });

        // Save the report to the database
        await report.save();

        console.log(`Successfully imported report for student ${record.studentnumber}`);
        imported.push(report);
      } catch (err) {
        console.error(`Error processing record ${index + 1}:`, err);
        errors.push(`Error importing report for student ${record.studentnumber}: ${err.message}`);
      }
    }

    console.log('Import completed:', {
      total: records.length,
      imported: imported.length,
      errors: errors.length
    });

    return NextResponse.json({
      imported: imported.length,
      total: records.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process CSV file',
        details: error.message
      },
      { status: 500 }
    );
  }
} 