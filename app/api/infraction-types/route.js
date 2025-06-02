import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InfractionType from '@/lib/models/InfractionType';

// GET all active infraction types
export async function GET() {
  try {
    await connectDB();
    const infractionTypes = await InfractionType.find({ isActive: true })
      .sort({ order: 1, displayName: 1 });
    return NextResponse.json(infractionTypes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new infraction type
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

    const infractionType = await InfractionType.create({
      ...data,
      updatedBy: data.createdBy // Set initial updatedBy to createdBy
    });

    return NextResponse.json(infractionType, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update infraction type
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

    const infractionType = await InfractionType.findOneAndUpdate(
      { name: data.name },
      { ...data },
      { new: true, runValidators: true }
    );

    if (!infractionType) {
      return NextResponse.json(
        { error: 'Infraction type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(infractionType);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE infraction type (soft delete)
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

    const infractionType = await InfractionType.findOneAndUpdate(
      { name },
      { isActive: false, updatedBy },
      { new: true }
    );

    if (!infractionType) {
      return NextResponse.json(
        { error: 'Infraction type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Infraction type deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 