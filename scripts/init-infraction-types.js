import connectDB from '../lib/mongodb';
import InfractionType from '../lib/models/InfractionType';

const infractionTypes = [
  {
    name: 'CUT_CLASS',
    displayName: 'cut class or >15min late',
    createdBy: 'system@example.com'
  },
  {
    name: 'IMPROPER_LANGUAGE',
    displayName: 'improper language or profanity',
    createdBy: 'system@example.com'
  },
  {
    name: 'FAILURE_TO_MEET_EXPECTATIONS',
    displayName: 'failure to meet classroom expectations',
    createdBy: 'system@example.com'
  },
  {
    name: 'CELLPHONE',
    displayName: 'cellphone',
    createdBy: 'system@example.com'
  },
  {
    name: 'LEAVING_WITHOUT_PERMISSION',
    displayName: 'leaving class without permission',
    createdBy: 'system@example.com'
  },
  {
    name: 'MISUSE_OF_HALLPASS',
    displayName: 'misuse of hallpass',
    createdBy: 'system@example.com'
  },
  {
    name: 'TARDINESS',
    displayName: 'tardiness to class',
    createdBy: 'system@example.com'
  },
  {
    name: 'MINOR_VANDALISM',
    displayName: 'minor vandalism',
    createdBy: 'system@example.com'
  }
];

async function initializeInfractionTypes() {
  try {
    await connectDB();
    
    // Clear existing infraction types
    await InfractionType.deleteMany({});
    
    // Insert new infraction types
    const createdTypes = await InfractionType.insertMany(
      infractionTypes.map((type, index) => ({
        ...type,
        order: index,
        updatedBy: type.createdBy
      }))
    );
    
    console.log(`Successfully initialized ${createdTypes.length} infraction types`);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing infraction types:', error);
    process.exit(1);
  }
}

initializeInfractionTypes(); 