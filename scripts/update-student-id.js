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

async function updateStudentId() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and update the student with ID 12345
    const result = await Student.findOneAndUpdate(
      { studentId: '12345' },
      { studentId: '123450' },
      { new: true }
    );

    if (result) {
      console.log('Successfully updated student ID:');
      console.log(`${result.firstName} ${result.lastName} (${result.studentId})`);
    } else {
      console.log('No student found with ID 12345');
    }

  } catch (error) {
    console.error('Error updating student ID:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updateStudentId(); 