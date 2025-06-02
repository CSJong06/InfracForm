import connectDB from '../lib/mongodb';
import InterventionType from '../lib/models/InterventionType';

const interventionTypes = [
  {
    name: 'EMAILED_PARENT',
    displayName: 'Emailed parent/gaudian',
    createdBy: 'system@example.com'
  },
  {
    name: 'CALLED_HOME_LEFT_MESSAGE',
    displayName: 'Called home: left message',
    createdBy: 'system@example.com'
  },
  {
    name: 'CALLED_HOME_SPOKE',
    displayName: 'Called home: spoke with parent/gaurdian',
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
    displayName: 'check-in',
    createdBy: 'system@example.com'
  },
  {
    name: 'TEACHER_STRATEGY',
    displayName: 'teacher strategy (describe in notes)',
    createdBy: 'system@example.com'
  },
  {
    name: 'CALLED_HOME_DISCONNECTED',
    displayName: 'Called home: disconnected',
    createdBy: 'system@example.com'
  },
  {
    name: 'ADVISOR_COUNSELOR_REFERRAL',
    displayName: 'advisr/counselor referral',
    createdBy: 'system@example.com'
  },
  {
    name: 'LETTER_SENT_HOME',
    displayName: 'letter sent home',
    createdBy: 'system@example.com'
  },
  {
    name: 'SAP_REFERRAL',
    displayName: 'SAP referral',
    createdBy: 'system@example.com'
  },
  {
    name: 'INDIVIDUAL_RESTORATIVE_CONFERENCE',
    displayName: 'individual restorative conference',
    createdBy: 'system@example.com'
  },
  {
    name: 'HOME_VISIT',
    displayName: 'home visit',
    createdBy: 'system@example.com'
  },
  {
    name: 'GUIDANCE_COUNSELING',
    displayName: 'guadance counseling',
    createdBy: 'system@example.com'
  },
  {
    name: 'OUT_OF_CLASS_REFLECTION',
    displayName: 'out of class reflection',
    createdBy: 'system@example.com'
  },
  {
    name: 'CAREER_COLLEGE_COUNSELING',
    displayName: 'career/college counseling',
    createdBy: 'system@example.com'
  }
];

async function initializeInterventionTypes() {
  try {
    await connectDB();
    
    // Clear existing intervention types
    await InterventionType.deleteMany({});
    
    // Insert new intervention types
    const createdTypes = await InterventionType.insertMany(
      interventionTypes.map((type, index) => ({
        ...type,
        order: index,
        updatedBy: type.createdBy
      }))
    );
    
    console.log(`Successfully initialized ${createdTypes.length} intervention types`);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing intervention types:', error);
    process.exit(1);
  }
}

initializeInterventionTypes(); 