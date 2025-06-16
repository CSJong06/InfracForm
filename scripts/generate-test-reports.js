import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import Report from '../lib/models/Report.js';
import InteractionType from '../lib/models/InteractionType.js';
import Student from '../lib/models/Student.js';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// Interaction type codes - must match exactly with the database
const interactionTypes = [
  'SHOUT_OUT',
  'CHECK_IN_WITH_GUARDIAN',
  'CHECK_IN_WITH_STUDENT',
  'ATTENDANCE_TRACKING',
  'PARENT_LIAISON_CHECK_IN',
  'BSS_CHECK_IN',
  'ADVISORY_ONE_ON_ONE_CONFERENCE',
  'ADVISORY_CHECK_IN_WITH_GUARDIAN',
  'INFRACTION',
  'INFORMATION_SHARING',
  'DELETED_LOG',
  'ADMIN_CHECK_IN',
  'STUDENT_OF_THE_MONTH',
  'COUNSELOR_CHECK_IN',
  'STUDIO_ONE_ON_ONE_CONFERENCE',
  'TWENTY_FIRST_CENTURY_CHECK_IN'
];

const infractionTypes = {
  'CUT_CLASS': 'cut class or >15min late',
  'IMPROPER_LANGUAGE': 'improper language or profanity',
  'FAILURE_TO_MEET_EXPECTATIONS': 'failure to meet classroom expectations',
  'CELLPHONE': 'cellphone',
  'LEAVING_WITHOUT_PERMISSION': 'leaving class without permission',
  'MISUSE_OF_HALLPASS': 'misuse of hallpass',
  'TARDINESS': 'tardiness to class',
  'MINOR_VANDALISM': 'minor vandalism',
  'NONE': 'NONE'
};

// Use only allowed intervention values from the Report schema
const interventionTypes = [
  'NONE',
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
  'teacher1@school.edu',
  'teacher2@school.edu',
  'counselor@school.edu',
  'admin@school.edu',
  'liaison@school.edu'
];

const notes = [
  'Student showed excellent participation in class discussion.',
  'Parent meeting scheduled for next week to discuss academic progress.',
  'Student was 15 minutes late to class.',
  'Outstanding improvement in behavior and class participation.',
  'Concerns about recent attendance patterns.',
  'Great leadership shown in group project.',
  'Needs additional support with homework completion.',
  'Parent requested follow-up meeting.',
  'Excellent work on recent assignment.',
  'Student needs to improve class participation.',
  'Positive behavior change observed.',
  'Academic concerns discussed with student.',
  'Parent contacted regarding attendance.',
  'Student of the month nomination submitted.',
  'Counseling session completed successfully.'
];

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInteraction() {
  return interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
}

function getRandomInfraction() {
  const codes = Object.keys(infractionTypes);
  return codes[Math.floor(Math.random() * codes.length)];
}

function getRandomIntervention() {
  return interventionTypes[Math.floor(Math.random() * interventionTypes.length)];
}

async function ensureInteractionTypes() {
  // Create interaction types if they don't exist
  for (const type of interactionTypes) {
    await InteractionType.findOneAndUpdate(
      { name: type },
      { 
        name: type,
        displayName: type.replace(/_/g, ' '),
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system'
      },
      { upsert: true }
    );
  }
}

async function getActiveStudents() {
  const students = await Student.find({ isActive: true });
  if (students.length === 0) {
    throw new Error('No active students found in the database. Please add some students first.');
  }
  return students;
}

async function generateTestReports(students) {
  const reports = [];
  const startDate = new Date(2024, 0, 1); // January 1, 2024
  const endDate = new Date(); // Current date

  for (let i = 0; i < 15; i++) {
    const interactionTimestamp = generateRandomDate(startDate, endDate);
    const entryTimestamp = new Date(interactionTimestamp.getTime() + Math.random() * 3600000); // Within 1 hour
    const isInfraction = Math.random() > 0.5;
    const interactionCode = isInfraction ? 'INFRACTION' : getRandomInteraction();
    
    // Select a random student from the active students
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    
    const report = {
      studentNumber: randomStudent.studentId,
      entryTimestamp,
      submitterEmail: submitterEmails[Math.floor(Math.random() * submitterEmails.length)],
      interaction: interactionCode,
      interactioncode: interactionCode,
      infraction: isInfraction ? getRandomInfraction() : 'NONE',
      intervention: isInfraction ? getRandomIntervention() : 'NONE',
      notes: notes[Math.floor(Math.random() * notes.length)],
      interactionTimestamp,
      status: Math.random() > 0.5 ? 'RESOLVED' : 'UNRESOLVED',
      interactionID: uuidv4()
    };

    reports.push(report);
  }

  return reports;
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Ensure interaction types exist
    console.log('Ensuring interaction types exist...');
    await ensureInteractionTypes();
    console.log('Interaction types verified');

    // Get active students
    console.log('Fetching active students...');
    const students = await getActiveStudents();
    console.log(`Found ${students.length} active students`);

    // Clear existing reports
    await Report.deleteMany({});
    console.log('Cleared existing reports');

    // Generate and insert test reports
    const testReports = await generateTestReports(students);
    await Report.insertMany(testReports);
    console.log('Inserted 15 test reports');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 