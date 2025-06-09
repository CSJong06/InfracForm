const mongoose = require('mongoose');
const path = require('path');

// Use relative path to the Report model
const Report = require(path.join(__dirname, '../lib/models/Report'));

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