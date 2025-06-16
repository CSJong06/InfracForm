import connectDB from '../mongodb.js';
import InteractionType from '../models/InteractionType.js';

const interactionTypes = [
  {
    name: 'CHECK_IN_WITH_GUARDIAN',
    displayName: 'Check-in with Guardian',
    shorthandCode: 'CG',
    isActive: true,
    order: 1,
    description: 'Check-in with student\'s guardian',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'CHECK_IN_WITH_STUDENT',
    displayName: 'Check-in with Student',
    shorthandCode: 'CS',
    isActive: true,
    order: 2,
    description: 'Check-in with student',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'ATTENDANCE_TRACKING',
    displayName: 'Attendance Tracking',
    shorthandCode: 'AT',
    isActive: true,
    order: 3,
    description: 'Track student attendance',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'PARENT_LIAISON_CHECK_IN',
    displayName: 'Parent Liaison Check-In',
    shorthandCode: 'PLCI',
    isActive: true,
    order: 4,
    description: 'Check-in with parent liaison',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'BSS_CHECK_IN',
    displayName: 'BSS Check-in',
    shorthandCode: 'BSSC',
    isActive: true,
    order: 5,
    description: 'Check-in with BSS',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'ADVISORY_ONE_ON_ONE_CONFERENCE',
    displayName: 'Advisory One-on-One Conference',
    shorthandCode: 'AOOC',
    isActive: true,
    order: 6,
    description: 'One-on-one conference with advisor',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'ADVISORY_CHECK_IN_WITH_GUARDIAN',
    displayName: 'Advisory Check-in with Guardian',
    shorthandCode: 'ACG',
    isActive: true,
    order: 7,
    description: 'Check-in with guardian through advisor',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'INFRACTION',
    displayName: 'Infraction',
    shorthandCode: 'I',
    isActive: true,
    order: 8,
    description: 'Student infraction',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'INFORMATION_SHARING',
    displayName: 'Information Sharing',
    shorthandCode: 'IS',
    isActive: true,
    order: 9,
    description: 'Share information about student',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'DELETED_LOG',
    displayName: 'Deleted Log',
    shorthandCode: 'D',
    isActive: true,
    order: 10,
    description: 'Deleted interaction log',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'ADMIN_CHECK_IN',
    displayName: 'Admin Check-in',
    shorthandCode: 'ACI',
    isActive: true,
    order: 11,
    description: 'Check-in with administrator',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'STUDENT_OF_THE_MONTH',
    displayName: 'Student of the Month',
    shorthandCode: 'SM',
    isActive: true,
    order: 12,
    description: 'Student of the month recognition',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'COUNSELOR_CHECK_IN',
    displayName: 'Counselor Check-in',
    shorthandCode: 'CC',
    isActive: true,
    order: 13,
    description: 'Check-in with counselor',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'STUDIO_ONE_ON_ONE_CONFERENCE',
    displayName: 'Studio One-on-One Conference',
    shorthandCode: 'SOOC',
    isActive: true,
    order: 14,
    description: 'One-on-one conference in studio',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'TWENTY_FIRST_CENTURY_CHECK_IN',
    displayName: '21st Century Check-In',
    shorthandCode: '21CCI',
    isActive: true,
    order: 15,
    description: 'Check-in with 21st century program',
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    name: 'SHOUT_OUT',
    displayName: 'Shout-out',
    shorthandCode: 'S',
    isActive: true,
    order: 16,
    description: 'Student shout-out',
    createdBy: 'system',
    updatedBy: 'system'
  }
];

async function initializeInteractionTypes() {
  try {
    await connectDB();
    
    // Clear existing interaction types
    await InteractionType.deleteMany({});
    
    // Insert new interaction types
    await InteractionType.insertMany(interactionTypes);
    
    console.log('Successfully initialized interaction types');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing interaction types:', error);
    process.exit(1);
  }
}

initializeInteractionTypes(); 