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

// Interaction type mapping
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

const infractionTypes = {
  'CUT_CLASS': 'cut class or >15min late',
  'IMPROPER_LANGUAGE': 'improper language or profanity',
  'FAILURE_TO_MEET_EXPECTATIONS': 'failure to meet classroom expectations',
  'CELLPHONE': 'cellphone',
  'LEAVING_WITHOUT_PERMISSION': 'leaving class without permission',
  'MISUSE_OF_HALLPASS': 'misuse of hallpass',
  'TARDINESS': 'tardiness to class',
  'MINOR_VANDALISM': 'minor vandalism'
};

const interventionTypes = {
  'NONE': 'NONE',
  'VERBAL_WARNING': 'VERBAL_WARNING',
  'WRITTEN_WARNING': 'WRITTEN_WARNING',
  'PARENT_CONTACT': 'PARENT_CONTACT',
  'ADMINISTRATIVE': 'ADMINISTRATIVE'
};

const studentNumbers = [
  '123456',
  '234567',
  '345678',
  '456789',
  '567890'
];

const submitterEmails = [
  'teacher1@school.edu',
  'teacher2@school.edu',
  'counselor@school.edu',
  'admin@school.edu',
  'liaison@school.edu'
];

const notes = [
  'Student was late to class by 15 minutes.',
  'Excellent participation in group discussion.',
  'Parent meeting scheduled for next week.',
  'Student needs additional support with homework.',
  'Outstanding improvement in behavior.',
  'Concerns about attendance patterns.',
  'Great leadership shown in group project.',
  'Needs to improve class participation.',
  'Excellent work on recent assignment.',
  'Parent requested follow-up meeting.'
];

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInteraction() {
  const codes = Object.keys(interactionTypes);
  return codes[Math.floor(Math.random() * codes.length)];
}

function getRandomInfraction() {
  const codes = Object.keys(infractionTypes);
  return codes[Math.floor(Math.random() * codes.length)];
}

function getRandomIntervention() {
  const codes = Object.keys(interventionTypes);
  return codes[Math.floor(Math.random() * codes.length)];
}

function generateTestReports() {
  const reports = [];
  const startDate = new Date(2024, 0, 1); // January 1, 2024
  const endDate = new Date(); // Current date

  for (let i = 0; i < 15; i++) {
    const interactionTimestamp = generateRandomDate(startDate, endDate);
    const entryTimestamp = new Date(interactionTimestamp.getTime() + Math.random() * 3600000); // Within 1 hour
    const isInfraction = Math.random() > 0.5;
    const interactionCode = isInfraction ? 'I' : getRandomInteraction();
    
    const report = {
      studentNumber: studentNumbers[Math.floor(Math.random() * studentNumbers.length)],
      entryTimestamp,
      submitterEmail: submitterEmails[Math.floor(Math.random() * submitterEmails.length)],
      interaction: interactionTypes[interactionCode],
      interactioncode: interactionCode,
      infraction: isInfraction ? getRandomInfraction() : 'NONE',
      intervention: isInfraction ? getRandomIntervention() : 'NONE',
      notes: notes[Math.floor(Math.random() * notes.length)],
      interactionTimestamp,
      status: Math.random() > 0.5 ? 'RESOLVED' : 'UNRESOLVED',
      interactionID: `2_${Math.random().toString(36).substring(2, 15)}`
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

    // Clear existing reports
    await Report.deleteMany({});
    console.log('Cleared existing reports');

    // Generate and insert test reports
    const testReports = generateTestReports();
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