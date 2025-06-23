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

function generateRandomDate(start, end) { // Generate a random date between start and end dates
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); // Use Math.random to get random timestamp within range
}

function getRandomInteraction() { // Get a random interaction type from the predefined list
  return interactionTypes[Math.floor(Math.random() * interactionTypes.length)]; // Use Math.random to select random index from array
}

function getRandomInfraction() { // Get a random infraction type from the predefined object
  const codes = Object.keys(infractionTypes); // Extract all infraction codes as an array
  return codes[Math.floor(Math.random() * codes.length)]; // Use Math.random to select random infraction code
}

function getRandomIntervention() { // Get a random intervention type from the predefined list
  return interventionTypes[Math.floor(Math.random() * interventionTypes.length)]; // Use Math.random to select random index from array
}

async function ensureInteractionTypes() { // Ensure all required interaction types exist in the database
  // Create interaction types if they don't exist
  for (const type of interactionTypes) { // Iterate through all predefined interaction types
    await InteractionType.findOneAndUpdate( // Use findOneAndUpdate with upsert to create or update interaction type
      { name: type }, // Search by interaction type name
      { 
        name: type, // Set the interaction type name
        displayName: type.replace(/_/g, ' '), // Convert underscores to spaces for display name
        isActive: true, // Mark interaction type as active
        createdBy: 'system', // Set creator as system for test data
        updatedBy: 'system' // Set updater as system for test data
      },
      { upsert: true } // Create new document if it doesn't exist, update if it does
    );
  }
}

async function getActiveStudents() { // Fetch all active students from the database for test report generation
  const students = await Student.find({ isActive: true }); // Query database for students with isActive flag set to true
  if (students.length === 0) { // Check if no active students were found
    throw new Error('No active students found in the database. Please add some students first.'); // Throw descriptive error message
  }
  return students; // Return array of active students
}

async function generateTestReports(students) { // Generate test report data using provided students
  const reports = []; // Initialize empty array to store generated reports
  const startDate = new Date(2024, 0, 1); // Set start date to January 1, 2024 (month is 0-indexed)
  const endDate = new Date(); // Set end date to current date

  for (let i = 0; i < 15; i++) { // Generate 15 test reports
    const interactionTimestamp = generateRandomDate(startDate, endDate); // Generate random interaction timestamp
    const entryTimestamp = new Date(interactionTimestamp.getTime() + Math.random() * 3600000); // Entry timestamp within 1 hour of interaction
    const isInfraction = Math.random() > 0.5; // 50% chance of generating an infraction vs positive interaction
    const interactionCode = isInfraction ? 'INFRACTION' : getRandomInteraction(); // Set interaction code based on infraction flag
    
    // Select a random student from the active students
    const randomStudent = students[Math.floor(Math.random() * students.length)]; // Pick random student from available students
    
    const report = { // Create report object with generated data
      studentNumber: randomStudent.studentId, // Use selected student's ID
      entryTimestamp, // Use generated entry timestamp
      submitterEmail: submitterEmails[Math.floor(Math.random() * submitterEmails.length)], // Pick random submitter email
      interaction: interactionCode, // Set interaction type
      interactioncode: interactionCode, // Set interaction code (duplicate for consistency)
      infraction: isInfraction ? getRandomInfraction() : 'NONE', // Set infraction type or 'NONE' for positive interactions
      intervention: isInfraction ? getRandomIntervention() : 'NONE', // Set intervention type or 'NONE' for positive interactions
      notes: notes[Math.floor(Math.random() * notes.length)], // Pick random note from predefined list
      interactionTimestamp, // Use generated interaction timestamp
      status: Math.random() > 0.5 ? 'RESOLVED' : 'UNRESOLVED', // 50% chance of resolved vs unresolved status
      interactionID: uuidv4() // Generate unique interaction ID using UUID
    };

    reports.push(report); // Add generated report to reports array
  }

  return reports; // Return array of generated test reports
}

async function main() { // Main execution function for the test data generation script
  try {
    console.log('Connecting to MongoDB...'); // Log connection attempt
    await mongoose.connect(process.env.MONGODB_URI); // Connect to MongoDB using environment variable
    console.log('Connected to MongoDB'); // Log successful connection

    // Ensure interaction types exist
    console.log('Ensuring interaction types exist...'); // Log interaction type verification start
    await ensureInteractionTypes(); // Create or update all required interaction types in database
    console.log('Interaction types verified'); // Log successful interaction type verification

    // Get active students
    console.log('Fetching active students...'); // Log student fetching start
    const students = await getActiveStudents(); // Fetch all active students from database
    console.log(`Found ${students.length} active students`); // Log number of active students found

    // Clear existing reports
    await Report.deleteMany({}); // Remove all existing reports from database
    console.log('Cleared existing reports'); // Log successful report clearing

    // Generate and insert test reports
    const testReports = await generateTestReports(students); // Generate test report data using active students
    await Report.insertMany(testReports); // Insert all generated reports into database in bulk
    console.log('Inserted 15 test reports'); // Log successful report insertion

    await mongoose.disconnect(); // Disconnect from MongoDB database
    console.log('Disconnected from MongoDB'); // Log successful disconnection
    process.exit(0); // Exit process with success code
  } catch (error) { // Catch any errors during script execution
    console.error('Error:', error); // Log error details to console
    process.exit(1); // Exit process with error code
  }
}

main(); // Execute the main function to run the test data generation script 