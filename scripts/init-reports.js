import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import Report from '../lib/models/Report.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const mockReports = [
  {
    studentNumber: '123456',
    submitterEmail: 'teacher@example.com',
    interaction: 'INFRACTION',
    infraction: 'CELLPHONE',
    intervention: 'VERBAL_WARNING',
    notes: 'Student was using phone during class instruction',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'UNRESOLVED',
    editUrl: '/reports/1/edit'
  },
  {
    studentNumber: '234567',
    submitterEmail: 'teacher@example.com',
    interaction: 'SHOUT_OUT',
    notes: 'Excellent participation in class discussion',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    status: 'RESOLVED',
    editUrl: '/reports/2/edit'
  },
  {
    studentNumber: '345678',
    submitterEmail: 'counselor@example.com',
    interaction: 'COUNSELOR_CHECK_IN',
    notes: 'Regular check-in session completed',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    status: 'RESOLVED',
    editUrl: '/reports/3/edit'
  },
  {
    studentNumber: '456789',
    submitterEmail: 'teacher@example.com',
    interaction: 'INFRACTION',
    infraction: 'TARDINESS',
    intervention: 'WRITTEN_WARNING',
    notes: 'Student arrived 20 minutes late to class',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    status: 'UNRESOLVED',
    editUrl: '/reports/4/edit'
  },
  {
    studentNumber: '567890',
    submitterEmail: 'advisor@example.com',
    interaction: 'ADVISORY_ONE_ON_ONE',
    notes: 'Discussed academic progress and goals',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 hours ago
    status: 'RESOLVED',
    editUrl: '/reports/5/edit'
  },
  {
    studentNumber: '678901',
    submitterEmail: 'teacher@example.com',
    interaction: 'INFRACTION',
    infraction: 'IMPROPER_LANGUAGE',
    intervention: 'PARENT_CONTACT',
    notes: 'Used inappropriate language in classroom',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    status: 'UNRESOLVED'
  },
  {
    studentNumber: '789012',
    submitterEmail: 'admin@example.com',
    interaction: 'ADMIN_CHECK_IN',
    notes: 'Regular administrative check-in completed',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 14), // 14 hours ago
    status: 'RESOLVED'
  },
  {
    studentNumber: '890123',
    submitterEmail: 'teacher@example.com',
    interaction: 'INFRACTION',
    infraction: 'FAILURE_TO_MEET_EXPECTATIONS',
    intervention: 'ADMINISTRATIVE',
    notes: 'Consistently not following classroom rules',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 16), // 16 hours ago
    status: 'UNRESOLVED'
  },
  {
    studentNumber: '901234',
    submitterEmail: 'teacher@example.com',
    interaction: 'STUDENT_OF_THE_MONTH',
    notes: 'Nominated for exceptional academic performance',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
    status: 'RESOLVED'
  },
  {
    studentNumber: '012345',
    submitterEmail: 'teacher@example.com',
    interaction: 'INFRACTION',
    infraction: 'LEAVING_WITHOUT_PERMISSION',
    intervention: 'PARENT_CONTACT',
    notes: 'Left classroom without permission',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
    status: 'UNRESOLVED'
  },
  {
    studentNumber: '123789',
    submitterEmail: 'teacher@example.com',
    interaction: 'CHECK_IN_WITH_STUDENT',
    notes: 'Regular check-in about academic progress',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
    status: 'RESOLVED'
  },
  {
    studentNumber: '234890',
    submitterEmail: 'teacher@example.com',
    interaction: 'INFRACTION',
    infraction: 'MISUSE_OF_HALLPASS',
    intervention: 'WRITTEN_WARNING',
    notes: 'Used hall pass for non-emergency purposes',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    status: 'UNRESOLVED'
  },
  {
    studentNumber: '345901',
    submitterEmail: 'teacher@example.com',
    interaction: 'STUDIO_ONE_ON_ONE',
    notes: 'One-on-one conference about project progress',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
    status: 'RESOLVED'
  },
  {
    studentNumber: '456012',
    submitterEmail: 'teacher@example.com',
    interaction: 'INFRACTION',
    infraction: 'MINOR_VANDALISM',
    intervention: 'ADMINISTRATIVE',
    notes: 'Damaged classroom property',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 28), // 28 hours ago
    status: 'UNRESOLVED'
  },
  {
    studentNumber: '567123',
    submitterEmail: 'teacher@example.com',
    interaction: 'TWENTY_FIRST_CENTURY_CHECK_IN',
    notes: 'Regular check-in about 21st century skills progress',
    interactionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
    status: 'RESOLVED'
  }
];

async function initializeReports() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing reports
    console.log('Clearing existing reports...');
    await Report.deleteMany({});
    console.log('Existing reports cleared');

    // Insert new reports
    console.log('Inserting mock reports...');
    const reports = await Promise.all(
      mockReports.map(async (reportData, index) => {
        const report = new Report({
          ...reportData,
          interactionID: index + 1
        });
        return report.save();
      })
    );

    console.log(`Successfully initialized ${reports.length} reports`);

    // Log the inserted reports
    console.log('\nInserted reports:');
    reports.forEach(report => {
      console.log(`ID: ${report.interactionID} - ${report.interaction} for student ${report.studentNumber} (${report.status})`);
    });

  } catch (error) {
    console.error('Error initializing reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

initializeReports(); 