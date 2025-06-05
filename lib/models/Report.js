import mongoose from 'mongoose';

// Define the enums
const InteractionEnum = {
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

const InfractionEnum = {
  CUT_CLASS: 'cut class or >15min late',
  IMPROPER_LANGUAGE: 'improper language or profanity',
  FAILURE_TO_MEET_EXPECTATIONS: 'failure to meet classroom expectations',
  CELLPHONE: 'cellphone',
  LEAVING_WITHOUT_PERMISSION: 'leaving class without permission',
  MISUSE_OF_HALLPASS: 'misuse of hallpass',
  TARDINESS: 'tardiness to class',
  MINOR_VANDALISM: 'minor vandalism',
  NONE: 'NONE',
};

const InterventionEnum = {
  NONE: 'NONE',
  VERBAL_WARNING: 'VERBAL_WARNING',
  WRITTEN_WARNING: 'WRITTEN_WARNING',
  PARENT_CONTACT: 'PARENT_CONTACT',
  ADMINISTRATIVE: 'ADMINISTRATIVE'
};

// Create the schema
const reportSchema = new mongoose.Schema({
  interactionID: {
    type: String,
    required: true,
    unique: true
  },
  studentNumber: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6
  },
  entryTimestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  submitterEmail: {
    type: String,
    required: true,
    trim: true
  },
  interaction: {
    type: String,
    required: true,
    enum: Object.values(InteractionEnum)
  },
  interactioncode: {
    type: String,
    required: true,
    enum: Object.keys(InteractionEnum)
  },
  infraction: {
    type: String,
    required: function() {
      return this.interactioncode === 'I';
    },
    enum: Object.keys(InfractionEnum)
  },
  intervention: {
    type: String,
    required: function() {
      return this.interactioncode === 'I';
    },
    enum: Object.keys(InterventionEnum)
  },
  notes: {
    type: String,
    trim: true
  },
  interactionTimestamp: {
    type: Date,
    required: true
  },
  editUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['RESOLVED', 'UNRESOLVED'],
    default: 'UNRESOLVED',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the model first
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

// Function to handle index operations
async function handleIndexes() {
  try {
    // Drop old index if it exists
    await Report.collection.dropIndex('studentInteractionID_1').catch(() => {
      // Ignore error if index doesn't exist
    });

    // Create new indexes
    await Report.collection.createIndex({ studentNumber: 1, interactionTimestamp: -1 });
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ interactionID: 1 }, { unique: true });
  } catch (error) {
    console.error('Error handling indexes:', error);
  }
}

// Static method to get next interaction ID
Report.getNextInteractionID = async function() {
  const lastReport = await this.findOne().sort({ interactionID: -1 });
  return lastReport ? lastReport.interactionID + 1 : 1;
};

// Export both the model and the index handler
export { handleIndexes };
export default Report; 