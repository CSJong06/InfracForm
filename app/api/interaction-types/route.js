import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import InteractionType from '../../../lib/models/InteractionType.js';

// GET all active interaction types
export async function GET() {
  try {
    await connectDB();
    const interactionTypes = await InteractionType.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(interactionTypes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch interaction types' },
      { status: 500 }
    );
  }
}

// POST new interaction type
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.displayName || !data.createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const interactionType = await InteractionType.create({
      ...data,
      updatedBy: data.createdBy // Set initial updatedBy to createdBy
    });

    return NextResponse.json(interactionType, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update interaction type
export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    if (!data.name || !data.updatedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const interactionType = await InteractionType.findOneAndUpdate(
      { name: data.name },
      { ...data },
      { new: true, runValidators: true }
    );

    if (!interactionType) {
      return NextResponse.json(
        { error: 'Interaction type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(interactionType);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE interaction type (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const updatedBy = searchParams.get('updatedBy');

    if (!name || !updatedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const interactionType = await InteractionType.findOneAndUpdate(
      { name },
      { isActive: false, updatedBy },
      { new: true }
    );

    if (!interactionType) {
      return NextResponse.json(
        { error: 'Interaction type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Interaction type deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 