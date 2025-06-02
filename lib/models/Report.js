import mongoose from 'mongoose';

// Define the enums
const InteractionEnum = {
  SHOUT_OUT: 'Shout-out',
  CHECK_IN_WITH_GUARDIAN: 'Check-in with guardian',
  CHECK_IN_WITH_STUDENT: 'Check-in with student',
  ATTENDANCE_TRACKING: 'Attendance tracking',
  PARENT_LIAISON_CHECK_IN: 'Parent liaison check-in',
  BSS_CHECK_IN: 'BSS check-in',
  ADVISORY_ONE_ON_ONE: 'Advisory one-on-one conference',
  ADVISORY_GUARDIAN_CHECK_IN: 'Advisory check-in with gaurdian',
  INFRACTION: 'Infraction',
  INFORMATION_SHARING: 'Information sharing',
  DELETED_LOG: 'Deleted log',
  ADMIN_CHECK_IN: 'Admin check-in',
  STUDENT_OF_THE_MONTH: 'Student of the month',
  COUNSELOR_CHECK_IN: 'Counselor check-in',
  STUDIO_ONE_ON_ONE: 'studio one-onone conference',
  TWENTY_FIRST_CENTURY_CHECK_IN: '21st century check-in'
};

const InfractionEnum = {
  CUT_CLASS: 'cut class or >15min late',
  IMPROPER_LANGUAGE: 'improper language or profanity',
  FAILURE_TO_MEET_EXPECTATIONS: 'failure to meet classroom expectations',
  CELLPHONE: 'cellphone',
  LEAVING_WITHOUT_PERMISSION: 'leaving class without permission',
  MISUSE_OF_HALLPASS: 'misuse of hallpass',
  TARDINESS: 'tardiness to class',
  MINOR_VANDALISM: 'minor vandalism'
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
  studentInteractionID: {
    type: Number,
    required: true,
    unique: true,
    autoIncrement: true
  },
  studentNumber: {
    type: Number,
    required: true
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
    ref: 'InteractionType'
  },
  infraction: {
    type: String,
    required: true,
    ref: 'InfractionType'
  },
  intervention: {
    type: String,
    required: true,
    ref: 'InterventionType'
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
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create a compound index for better query performance
reportSchema.index({ studentNumber: 1, interactionTimestamp: -1 });

// Create the model
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report; 