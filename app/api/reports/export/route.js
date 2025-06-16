import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Report from '@/lib/models/Report';

// Map interaction types to their codes
const interactionTypeToCode = {
  'SHOUT_OUT': 'S',
  'CHECK_IN_WITH_GUARDIAN': 'CG',
  'CHECK_IN_WITH_STUDENT': 'CS',
  'ATTENDANCE_TRACKING': 'AT',
  'PARENT_LIAISON_CHECK_IN': 'PLCI',
  'BSS_CHECK_IN': 'BSSC',
  'ADVISORY_ONE_ON_ONE_CONFERENCE': 'AOOC',
  'ADVISORY_CHECK_IN_WITH_GUARDIAN': 'ACG',
  'INFRACTION': 'I',
  'INFORMATION_SHARING': 'IS',
  'DELETED_LOG': 'D',
  'ADMIN_CHECK_IN': 'ACI',
  'STUDENT_OF_THE_MONTH': 'SM',
  'COUNSELOR_CHECK_IN': 'CC',
  'STUDIO_ONE_ON_ONE_CONFERENCE': 'SOOC',
  'TWENTY_FIRST_CENTURY_CHECK_IN': '21CCI'
};

// Format date to YYYYMMDDHHMMSS
const formatDate = (date) => {
  const d = new Date(date);
  return d.getFullYear().toString() +
    (d.getMonth() + 1).toString().padStart(2, '0') +
    d.getDate().toString().padStart(2, '0') +
    d.getHours().toString().padStart(2, '0') +
    d.getMinutes().toString().padStart(2, '0') +
    d.getSeconds().toString().padStart(2, '0');
};

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all reports
    const reports = await Report.find()
      .sort({ interactionTimestamp: -1 });

    // Convert reports to CSV format
    const headers = [
      'studentnumber',
      'entrytimestamp',
      'submitteremail',
      'interactioncode',
      'responses',
      'notes',
      'interactiontimestamp',
      'editurl',
      'entryidentifier',
      'interactionid'
    ];

    const rows = reports.map(report => [
      report.studentNumber || '',
      formatDate(report.entryTimestamp),
      report.submitterEmail || '',
      interactionTypeToCode[report.interaction] || report.interaction || '',
      report.intervention === 'NONE' ? '' : (report.intervention || ''),
      (report.notes || '').replace(/"/g, '""'), // Escape quotes in notes
      formatDate(report.interactionTimestamp),
      `/reports/${report.interactionID}/edit`,
      report.interactionID,
      report.interactionID
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="reports-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export reports' },
      { status: 500 }
    );
  }
} 