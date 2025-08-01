import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Use relative path to the Report model
import Report from '../lib/models/Report.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function clearReports() {
  try {
    await mongoose.connect(MONGODB_URI);
    const result = await Report.deleteMany({});
    console.log(`Deleted ${result.deletedCount} reports.`);
  } catch (err) {
    console.error('Error clearing reports:', err);
  } finally {
    await mongoose.disconnect();
  }
}

clearReports(); 