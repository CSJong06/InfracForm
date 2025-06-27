import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import Report from '../lib/models/Report.js';
import Student from '../lib/models/Student.js';
import '../lib/models/InteractionType.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Interaction types and their shorthand codes from initializeInteractionTypes.js
const interactionTypes = [
  { name: 'CHECK_IN_WITH_GUARDIAN', code: 'CG' },
  { name: 'CHECK_IN_WITH_STUDENT', code: 'CS' },
  { name: 'ATTENDANCE_TRACKING', code: 'AT' },
  { name: 'PARENT_LIAISON_CHECK_IN', code: 'PLCI' },
  { name: 'BSS_CHECK_IN', code: 'BSSC' },
  { name: 'ADVISORY_ONE_ON_ONE_CONFERENCE', code: 'AOOC' },
  { name: 'ADVISORY_CHECK_IN_WITH_GUARDIAN', code: 'ACG' },
  { name: 'INFRACTION', code: 'I' },
  { name: 'INFORMATION_SHARING', code: 'IS' },
  { name: 'DELETED_LOG', code: 'D' },
  { name: 'ADMIN_CHECK_IN', code: 'ACI' },
  { name: 'STUDENT_OF_THE_MONTH', code: 'SM' },
  { name: 'COUNSELOR_CHECK_IN', code: 'CC' },
  { name: 'STUDIO_ONE_ON_ONE_CONFERENCE', code: 'SOOC' },
  { name: 'TWENTY_FIRST_CENTURY_CHECK_IN', code: '21CCI' },
  { name: 'SHOUT_OUT', code: 'S' }
];

// Infraction types from init-infraction-types.js
const infractionTypes = [
  'CUT_CLASS',
  'IMPROPER_LANGUAGE',
  'FAILURE_TO_MEET_EXPECTATIONS',
  'CELLPHONE',
  'LEAVING_WITHOUT_PERMISSION',
  'MISUSE_OF_HALLPASS',
  'TARDINESS',
  'MINOR_VANDALISM'
];

// Intervention types from init-intervention-types.js
const interventionTypes = [
  'EMAILED_PARENT',
  'CALLED_HOME_LEFT_MESSAGE',
  'CALLED_HOME_SPOKE',
  'PARENT_MEETING',
  'CALLED_HOME_NO_ANSWER',
  'GROUP_RESTORATIVE_CIRCLE',
  'DOOR_CONVERSATIONS',
  'CHECK_IN',
  'TEACHER_STRATEGY',
  'CALLED_HOME_DISCONNECTED',
  'ADVISOR_COUNSELOR_REFERRAL',
  'LETTER_SENT_HOME',
  'SAP_REFERRAL',
  'INDIVIDUAL_RESTORATIVE_CONFERENCE',
  'HOME_VISIT',
  'GUIDANCE_COUNSELING',
  'OUT_OF_CLASS_REFLECTION',
  'CAREER_COLLEGE_COUNSELING'
];

const submitterEmails = [
  'teacher@example.com',
  'counselor@example.com',
  'admin@example.com',
  'advisor@example.com'
];

const statuses = ['RESOLVED', 'UNRESOLVED'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNotes(type) {
  const notes = {
    general: [
      'Follow-up required.',
      'Student showed improvement.',
      'Parent contacted.',
      'No further action needed.',
      'Discussed academic progress.'
    ],
    infraction: [
      'Student was disruptive in class.',
      'Used phone during instruction.',
      'Arrived late to class.',
      'Left classroom without permission.',
      'Used inappropriate language.'
    ],
    intervention: [
      'Parent meeting scheduled.',
      'Restorative circle held.',
      'Guidance counseling provided.',
      'Teacher strategy implemented.'
    ]
  };
  return randomItem(notes[type] || notes.general);
}

function randomDateWithinDays(days) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(past);
}

async function generateReports() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get existing students from database
    console.log('Fetching existing students...');
    const students = await Student.find({ isActive: true });
    if (students.length === 0) {
      console.error('No active students found in database. Please run init-students.js first.');
      return;
    }
    
    const studentNumbers = students.map(student => student.studentId);
    console.log(`Found ${studentNumbers.length} active students: ${studentNumbers.join(', ')}`);

    // Clear existing reports
    console.log('Clearing existing reports...');
    await Report.deleteMany({});
    console.log('Existing reports cleared');

    const reports = [];
    for (let i = 0; i < 25; i++) {
      const studentNumber = randomItem(studentNumbers);
      const submitterEmail = randomItem(submitterEmails);
      const { name: interaction, code } = randomItem(interactionTypes);
      const interactioncode = interaction;
      let infraction = undefined;
      let intervention = undefined;
      let notes = randomNotes('general');
      let interventionNotes = '';

      if (interaction === 'INFRACTION') {
        infraction = randomItem(infractionTypes);
        intervention = randomItem(interventionTypes);
        notes = randomNotes('infraction');
        interventionNotes = randomNotes('intervention');
      }

      const status = randomItem(statuses);
      const interactionTimestamp = randomDateWithinDays(30);
      const entryTimestamp = new Date();
      const editUrl = `/reports/${i + 1}/edit`;

      reports.push({
        interactionID: (i + 1).toString(),
        studentNumber,
        entryTimestamp,
        submitterEmail,
        interaction,
        interactioncode,
        infraction,
        intervention,
        notes,
        interventionNotes,
        interactionTimestamp,
        editUrl,
        status
      });
    }

    // Insert new reports
    console.log('Inserting generated reports...');
    const inserted = await Report.insertMany(reports);
    console.log(`Successfully generated ${inserted.length} reports.`);

    // Log the inserted reports with student names
    console.log('\nInserted reports:');
    for (const report of inserted) {
      const student = students.find(s => s.studentId === report.studentNumber);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
      console.log(`ID: ${report.interactionID} - ${report.interaction} for ${studentName} (${report.studentNumber}) - ${report.status}`);
    }
  } catch (error) {
    console.error('Error generating reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

generateReports(); 