import connectDB from '../lib/mongodb';
import InteractionType from '../lib/models/InteractionType';
import InfractionType from '../lib/models/InfractionType';
import InterventionType from '../lib/models/InterventionType';

const interactionTypes = [
  {
    name: 'SHOUT_OUT',
    displayName: 'Shout-out',
    createdBy: 'system@example.com'
  },
  // ... rest of interaction types
];

const infractionTypes = [
  {
    name: 'CUT_CLASS',
    displayName: 'cut class or >15min late',
    createdBy: 'system@example.com'
  },
  // ... rest of infraction types
];

const interventionTypes = [
  {
    name: 'EMAILED_PARENT',
    displayName: 'Emailed parent/gaudian',
    createdBy: 'system@example.com'
  },
  // ... rest of intervention types
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