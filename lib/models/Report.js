import mongoose from 'mongoose';

// Define the enums for infraction types
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

// Create the schema for the Report collection
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
    trim: true,
    validate: {
      validator: async function(value) {
        const InteractionType = mongoose.model('InteractionType');
        const interactionType = await InteractionType.findOne({ name: value });
        return !!interactionType;
      },
      message: props => `${props.value} is not a valid interaction type`
    }
  },
  interactioncode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: async function(value) {
        const InteractionType = mongoose.model('InteractionType');
        const interactionType = await InteractionType.findOne({ name: value });
        return !!interactionType;
      },
      message: props => `${props.value} is not a valid interaction code`
    }
  },
  infraction: {
    type: String,
    required: function() {
      return this.interaction === 'Infraction';
    },
    enum: Object.keys(InfractionEnum),
    default: 'NONE'
  },
  intervention: {
    type: String,
    enum: ['NONE', 'EMAILED_PARENT', 'CALLED_HOME_LEFT_MESSAGE', 'CALLED_HOME_SPOKE', 'PARENT_MEETING', 'CALLED_HOME_NO_ANSWER', 'GROUP_RESTORATIVE_CIRCLE', 'DOOR_CONVERSATIONS', 'CHECK_IN', 'TEACHER_STRATEGY', 'CALLED_HOME_DISCONNECTED', 'ADVISOR_COUNSELOR_REFERRAL', 'LETTER_SENT_HOME', 'SAP_REFERRAL', 'INDIVIDUAL_RESTORATIVE_CONFERENCE', 'HOME_VISIT', 'GUIDANCE_COUNSELING', 'OUT_OF_CLASS_REFLECTION', 'CAREER_COLLEGE_COUNSELING'],
    default: 'NONE'
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

// Create the model for the Report collection
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

// Function to handle index operations for the Report collection
async function handleIndexes() {
  try {
    // Drop old index if it exists
    await Report.collection.dropIndex('studentInteractionID_1').catch(() => {
      // Ignore error if index doesn't exist
    });

    // Create new indexes for efficient queries
    await Report.collection.createIndex({ studentNumber: 1, interactionTimestamp: -1 });
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ interactionID: 1 }, { unique: true });
  } catch (error) {
    console.error('Error handling indexes:', error);
  }
}

// Static method to get the next available interaction ID
Report.getNextInteractionID = async function() { // Returns the next sequential interactionID for a new report
  const lastReport = await this.findOne().sort({ interactionID: -1 }); // Find the report with the highest interactionID
  return lastReport ? lastReport.interactionID + 1 : 1; // If found, increment; otherwise, start at 1
};

// Export both the model and the index handler
export { handleIndexes }; // Export the function to manage indexes for the Report collection
export default Report; // Export the Report model as the default export 