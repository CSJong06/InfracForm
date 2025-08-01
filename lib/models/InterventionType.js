import mongoose from 'mongoose';

const interventionTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
interventionTypeSchema.index({ isActive: 1, order: 1 });

// Create the model if it doesn't exist, otherwise use the existing model
const InterventionType = mongoose.models.InterventionType || mongoose.model('InterventionType', interventionTypeSchema);

export default InterventionType; 