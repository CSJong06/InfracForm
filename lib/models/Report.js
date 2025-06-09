import mongoose from 'mongoose';
import { InteractionEnum } from '../constants/interactionTypes.js';

// Define the enums
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
  EMAILED_PARENT: 'EMAILED_PARENT',
  CALLED_HOME_LEFT_MESSAGE: 'CALLED_HOME_LEFT_MESSAGE',
  CALLED_HOME_SPOKE: 'CALLED_HOME_SPOKE',
  PARENT_MEETING: 'PARENT_MEETING',
  CALLED_HOME_NO_ANSWER: 'CALLED_HOME_NO_ANSWER',
  GROUP_RESTORATIVE_CIRCLE: 'GROUP_RESTORATIVE_CIRCLE',
  DOOR_CONVERSATIONS: 'DOOR_CONVERSATIONS',
  CHECK_IN: 'CHECK_IN',
  TEACHER_STRATEGY: 'TEACHER_STRATEGY',
  CALLED_HOME_DISCONNECTED: 'CALLED_HOME_DISCONNECTED',
  ADVISOR_COUNSELOR_REFERRAL: 'ADVISOR_COUNSELOR_REFERRAL',
  LETTER_SENT_HOME: 'LETTER_SENT_HOME',
  SAP_REFERRAL: 'SAP_REFERRAL',
  INDIVIDUAL_RESTORATIVE_CONFERENCE: 'INDIVIDUAL_RESTORATIVE_CONFERENCE',
  HOME_VISIT: 'HOME_VISIT',
  GUIDANCE_COUNSELING: 'GUIDANCE_COUNSELING',
  OUT_OF_CLASS_REFLECTION: 'OUT_OF_CLASS_REFLECTION',
  CAREER_COLLEGE_COUNSELING: 'CAREER_COLLEGE_COUNSELING'
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
  interventionNotes: {
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

// Create the model
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