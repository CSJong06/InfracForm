import mongoose from 'mongoose'; // Import Mongoose for schema and model creation

const interactionTypeSchema = new mongoose.Schema({ // Define the structure of an interaction type document
  name: { // Field for the unique name of the interaction type
    type: String, // Store as a string
    required: true, // Must be provided
    unique: true, // Must be unique in the collection
    trim: true // Remove whitespace from both ends
  },
  displayName: { // Field for the human-readable display name
    type: String, // Store as a string
    required: true, // Must be provided
    trim: true // Remove whitespace from both ends
  },
  shorthandCode: { // Field for the abbreviated code
    type: String, // Store as a string
    required: true, // Must be provided
    trim: true, // Remove whitespace from both ends
    maxlength: 3, // Must be at most 3 characters
    uppercase: true // Convert to uppercase before saving
  },
  isActive: { // Field to determine if interaction type is active
    type: Boolean, // Store as a boolean
    default: true // Default to true (active type)
  },
  order: { // Field for sorting order of interaction types
    type: Number, // Store as a number
    default: 0 // Default to 0
  },
  description: { // Field for optional description of the interaction type
    type: String, // Store as a string
    trim: true // Remove whitespace from both ends
  },
  createdBy: { // Field for who created this interaction type
    type: String, // Store as a string
    required: true // Must be provided
  },
  updatedBy: { // Field for who last updated this interaction type
    type: String, // Store as a string
    required: true // Must be provided
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create indexes for better query performance
interactionTypeSchema.index({ isActive: 1, order: 1 }); // Create compound index for active types sorted by order

const InteractionType = mongoose.models.InteractionType || mongoose.model('InteractionType', interactionTypeSchema); // Create or retrieve InteractionType model

export default InteractionType; // Export the InteractionType model as default 