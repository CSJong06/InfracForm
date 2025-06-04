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

async function addStudent() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create new student
    const newStudent = new Student({
      studentId: '123450',
      firstName: 'Test',
      lastName: 'Student'
    });

    const result = await newStudent.save();
    console.log('Successfully added new student:');
    console.log(`${result.firstName} ${result.lastName} (${result.studentId})`);

  } catch (error) {
    console.error('Error adding student:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

addStudent(); 