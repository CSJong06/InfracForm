import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import mongoose from 'mongoose';

// Define the schema and model here to ensure it's available
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
    unique: true,
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
interventionTypeSchema.index({ name: 1 }, { unique: true });

// Create the model if it doesn't exist, otherwise use the existing model
const InterventionType = mongoose.models.InterventionType || mongoose.model('InterventionType', interventionTypeSchema);

// GET all active intervention types
export async function GET() {
  try {
    await connectDB();
    const interventionTypes = await InterventionType.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(interventionTypes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch intervention types' },
      { status: 500 }
    );
  }
}

// POST new intervention type
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const interventionType = new InterventionType({
      ...data,
      createdBy: data.createdBy || 'system',
      updatedBy: data.updatedBy || 'system'
    });
    
    await interventionType.save();
    return NextResponse.json(interventionType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create intervention type' },
      { status: 500 }
    );
  }
}

// PUT update intervention type
export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { _id, ...updateData } = data;
    
    const updatedType = await InterventionType.findByIdAndUpdate(
      _id,
      { ...updateData, updatedBy: updateData.updatedBy || 'system' },
      { new: true, runValidators: true }
    );
    
    if (!updatedType) {
      return NextResponse.json(
        { error: 'Intervention type not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update intervention type' },
      { status: 500 }
    );
  }
}

// DELETE intervention type (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const updatedType = await InterventionType.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: data.updatedBy || 'system' },
      { new: true }
    );
    
    if (!updatedType) {
      return NextResponse.json(
        { error: 'Intervention type not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete intervention type' },
      { status: 500 }
    );
  }
} 