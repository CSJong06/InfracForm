require('dotenv').config({ path: '.env.local' });
const connectDB = require('../lib/mongodb');
const InteractionType = require('../lib/models/InteractionType');
const InfractionType = require('../lib/models/InfractionType');
const InterventionType = require('../lib/models/InterventionType');

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
    displayName: 'Advisory check-in with guardian',
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
    displayName: 'Studio one-on-one conference',
    createdBy: 'system@example.com'
  },
  {
    name: 'TWENTY_FIRST_CENTURY_CHECK_IN',
    displayName: '21st century check-in',
    createdBy: 'system@example.com'
  }
];

const infractionTypes = [
  {
    name: 'CUT_CLASS',
    displayName: 'Cut class or >15min late',
    createdBy: 'system@example.com'
  },
  {
    name: 'IMPROPER_LANGUAGE',
    displayName: 'Improper language or profanity',
    createdBy: 'system@example.com'
  },
  {
    name: 'FAILURE_TO_MEET_EXPECTATIONS',
    displayName: 'Failure to meet classroom expectations',
    createdBy: 'system@example.com'
  },
  {
    name: 'CELLPHONE',
    displayName: 'Cellphone',
    createdBy: 'system@example.com'
  },
  {
    name: 'LEAVING_WITHOUT_PERMISSION',
    displayName: 'Leaving class without permission',
    createdBy: 'system@example.com'
  },
  {
    name: 'MISUSE_OF_HALLPASS',
    displayName: 'Misuse of hallpass',
    createdBy: 'system@example.com'
  },
  {
    name: 'TARDINESS',
    displayName: 'Tardiness to class',
    createdBy: 'system@example.com'
  },
  {
    name: 'MINOR_VANDALISM',
    displayName: 'Minor vandalism',
    createdBy: 'system@example.com'
  }
];

const interventionTypes = [
  {
    name: 'EMAILED_PARENT',
    displayName: 'Emailed parent/guardian',
    createdBy: 'system@example.com'
  },
  {
    name: 'CALLED_HOME_LEFT_MESSAGE',
    displayName: 'Called home: left message',
    createdBy: 'system@example.com'
  },
  {
    name: 'CALLED_HOME_SPOKE',
    displayName: 'Called home: spoke with parent/guardian',
    createdBy: 'system@example.com'
  },
  {
    name: 'PARENT_MEETING',
    displayName: 'Parent meeting',
    createdBy: 'system@example.com'
  },
  {
    name: 'CALLED_HOME_NO_ANSWER',
    displayName: 'Called home: No answer',
    createdBy: 'system@example.com'
  },
  {
    name: 'GROUP_RESTORATIVE_CIRCLE',
    displayName: 'Group restorative circle',
    createdBy: 'system@example.com'
  },
  {
    name: 'DOOR_CONVERSATIONS',
    displayName: 'Door conversations',
    createdBy: 'system@example.com'
  },
  {
    name: 'CHECK_IN',
    displayName: 'Check-in',
    createdBy: 'system@example.com'
  },
  {
    name: 'TEACHER_STRATEGY',
    displayName: 'Teacher strategy (describe in notes)',
    createdBy: 'system@example.com'
  },
  {
    name: 'CALLED_HOME_DISCONNECTED',
    displayName: 'Called home: disconnected',
    createdBy: 'system@example.com'
  },
  {
    name: 'ADVISOR_COUNSELOR_REFERRAL',
    displayName: 'Advisor/counselor referral',
    createdBy: 'system@example.com'
  },
  {
    name: 'LETTER_SENT_HOME',
    displayName: 'Letter sent home',
    createdBy: 'system@example.com'
  },
  {
    name: 'SAP_REFERRAL',
    displayName: 'SAP referral',
    createdBy: 'system@example.com'
  },
  {
    name: 'INDIVIDUAL_RESTORATIVE_CONFERENCE',
    displayName: 'Individual restorative conference',
    createdBy: 'system@example.com'
  },
  {
    name: 'HOME_VISIT',
    displayName: 'Home visit',
    createdBy: 'system@example.com'
  },
  {
    name: 'GUIDANCE_COUNSELING',
    displayName: 'Guidance counseling',
    createdBy: 'system@example.com'
  },
  {
    name: 'OUT_OF_CLASS_REFLECTION',
    displayName: 'Out of class reflection',
    createdBy: 'system@example.com'
  },
  {
    name: 'CAREER_COLLEGE_COUNSELING',
    displayName: 'Career/college counseling',
    createdBy: 'system@example.com'
  }
];

async function initializeAllTypes() {
  try {
    await connectDB();
    
    // Clear existing types
    await Promise.all([
      InteractionType.deleteMany({}),
      InfractionType.deleteMany({}),
      InterventionType.deleteMany({})
    ]);
    
    // Insert new types
    const [createdInteractions, createdInfractions, createdInterventions] = await Promise.all([
      InteractionType.insertMany(
        interactionTypes.map((type, index) => ({
          ...type,
          order: index,
          updatedBy: type.createdBy
        }))
      ),
      InfractionType.insertMany(
        infractionTypes.map((type, index) => ({
          ...type,
          order: index,
          updatedBy: type.createdBy
        }))
      ),
      InterventionType.insertMany(
        interventionTypes.map((type, index) => ({
          ...type,
          order: index,
          updatedBy: type.createdBy
        }))
      )
    ]);
    
    console.log('Successfully initialized all types:');
    console.log(`- ${createdInteractions.length} interaction types`);
    console.log(`- ${createdInfractions.length} infraction types`);
    console.log(`- ${createdInterventions.length} intervention types`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing types:', error);
    process.exit(1);
  }
}

initializeAllTypes(); 