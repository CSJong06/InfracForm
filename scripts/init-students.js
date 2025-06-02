import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import Student from '../lib/models/Student.js';

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

const testStudents = [
  { studentId: '123456', firstName: 'Emma', lastName: 'Thompson' },
  { studentId: '234567', firstName: 'James', lastName: 'Wilson' },
  { studentId: '345678', firstName: 'Sophia', lastName: 'Rodriguez' },
  { studentId: '456789', firstName: 'Lucas', lastName: 'Chen' },
  { studentId: '567890', firstName: 'Olivia', lastName: 'Patel' },
  { studentId: '678901', firstName: 'Noah', lastName: 'Kim' },
  { studentId: '789012', firstName: 'Ava', lastName: 'Martinez' },
  { studentId: '890123', firstName: 'Ethan', lastName: 'Johnson' },
  { studentId: '901234', firstName: 'Isabella', lastName: 'Nguyen' },
  { studentId: '012345', firstName: 'Mason', lastName: 'Anderson' },
  { studentId: '123789', firstName: 'Charlotte', lastName: 'Taylor' },
  { studentId: '234890', firstName: 'William', lastName: 'Garcia' },
  { studentId: '345901', firstName: 'Amelia', lastName: 'Lee' },
  { studentId: '456012', firstName: 'Benjamin', lastName: 'Brown' },
  { studentId: '567123', firstName: 'Mia', lastName: 'Davis' }
];

async function initializeStudents() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing students
    console.log('Clearing existing students...');
    await Student.deleteMany({});
    console.log('Existing students cleared');

    // Insert new students
    console.log('Inserting test students...');
    const result = await Student.insertMany(testStudents);
    console.log(`Successfully initialized ${result.length} students`);

    // Log the inserted students
    console.log('\nInserted students:');
    result.forEach(student => {
      console.log(`${student.firstName} ${student.lastName} (${student.studentId})`);
    });

  } catch (error) {
    console.error('Error initializing students:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

initializeStudents(); 