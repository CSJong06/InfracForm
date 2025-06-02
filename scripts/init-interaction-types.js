import connectDB from '../lib/mongodb';
import InteractionType from '../lib/models/InteractionType';

const interactionTypes = [
  {
    name: 'SHOUT_OUT',
    displayName: 'Shout-out',
    createdBy: 'system@example.com'
  },
  {
    name: 'CHECK_IN_WITH_GUARDIAN',
    displayName: 'Check-in with guardian',
    createdBy: 'system@example.com'
  },
  {
    name: 'CHECK_IN_WITH_STUDENT',
    displayName: 'Check-in with student',
    createdBy: 'system@example.com'
  },
  {
    name: 'ATTENDANCE_TRACKING',
    displayName: 'Attendance tracking',
    createdBy: 'system@example.com'
  },
  {
    name: 'PARENT_LIAISON_CHECK_IN',
    displayName: 'Parent liaison check-in',
    createdBy: 'system@example.com'
  },
  {
    name: 'BSS_CHECK_IN',
    displayName: 'BSS check-in',
    createdBy: 'system@example.com'
  },
  {
    name: 'ADVISORY_ONE_ON_ONE',
    displayName: 'Advisory one-on-one conference',
    createdBy: 'system@example.com'
  },
  {
    name: 'ADVISORY_GUARDIAN_CHECK_IN',
    displayName: 'Advisory check-in with gaurdian',
    createdBy: 'system@example.com'
  },
  {
    name: 'INFRACTION',
    displayName: 'Infraction',
    createdBy: 'system@example.com'
  },
  {
    name: 'INFORMATION_SHARING',
    displayName: 'Information sharing',
    createdBy: 'system@example.com'
  },
  {
    name: 'DELETED_LOG',
    displayName: 'Deleted log',
    createdBy: 'system@example.com'
  },
  {
    name: 'ADMIN_CHECK_IN',
    displayName: 'Admin check-in',
    createdBy: 'system@example.com'
  },
  {
    name: 'STUDENT_OF_THE_MONTH',
    displayName: 'Student of the month',
    createdBy: 'system@example.com'
  },
  {
    name: 'COUNSELOR_CHECK_IN',
    displayName: 'Counselor check-in',
    createdBy: 'system@example.com'
  },
  {
    name: 'STUDIO_ONE_ON_ONE',
    displayName: 'studio one-onone conference',
    createdBy: 'system@example.com'
  },
  {
    name: 'TWENTY_FIRST_CENTURY_CHECK_IN',
    displayName: '21st century check-in',
    createdBy: 'system@example.com'
  }
];

async function initializeInteractionTypes() {
  try {
    await connectDB();
    
    // Clear existing interaction types
    await InteractionType.deleteMany({});
    
    // Insert new interaction types
    const createdTypes = await InteractionType.insertMany(
      interactionTypes.map((type, index) => ({
        ...type,
        order: index,
        updatedBy: type.createdBy
      }))
    );
    
    console.log(`Successfully initialized ${createdTypes.length} interaction types`);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing interaction types:', error);
    process.exit(1);
  }
}

initializeInteractionTypes(); 