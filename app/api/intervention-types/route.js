import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InterventionType from '@/lib/models/InterventionType';

// GET all active intervention types
export async function GET() {
  try {
    await connectDB();
    const interventionTypes = await InterventionType.find({ isActive: true })
      .sort({ order: 1, displayName: 1 });
    return NextResponse.json(interventionTypes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new intervention type
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

    const interventionType = await InterventionType.create({
      ...data,
      updatedBy: data.createdBy // Set initial updatedBy to createdBy
    });

    return NextResponse.json(interventionType, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update intervention type
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

    const interventionType = await InterventionType.findOneAndUpdate(
      { name: data.name },
      { ...data },
      { new: true, runValidators: true }
    );

    if (!interventionType) {
      return NextResponse.json(
        { error: 'Intervention type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(interventionType);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE intervention type (soft delete)
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

    const interventionType = await InterventionType.findOneAndUpdate(
      { name },
      { isActive: false, updatedBy },
      { new: true }
    );

    if (!interventionType) {
      return NextResponse.json(
        { error: 'Intervention type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Intervention type deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 