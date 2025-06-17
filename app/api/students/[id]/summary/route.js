import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb.js';
import Student from '../../../../../lib/models/Student.js';
import Report from '../../../../../lib/models/Report.js';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findOne({ studentId: id });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    const reports = await Report.find({ studentNumber: id });
    console.log('Fetched Reports:', reports);
    const infractions = reports.filter(report => report.interaction === 'INFRACTION');
    console.log('Infractions:', infractions);
    const infractionTypes = [...new Set(infractions.map(report => report.infraction).filter(type => type !== 'NONE'))];
    console.log('Infraction Types:', infractionTypes);
    return NextResponse.json({
      studentName: `${student.firstName} ${student.lastName}`,
      totalReports: reports.length,
      infractionCount: infractions.length,
      infractionTypes: infractionTypes.length > 0 ? infractionTypes : [],
      message: reports.length === 0 ? 'No reports found for this student.' : infractions.length === 0 ? 'No infractions recorded for this student.' : null
    });
  } catch (error) {
    console.error('Error fetching student summary:', error);
    return NextResponse.json({ error: 'Failed to fetch student summary' }, { status: 500 });
  }
} 