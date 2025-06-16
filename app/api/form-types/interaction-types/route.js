import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InteractionType from '@/lib/models/InteractionType';
import Report from '@/lib/models/Report';
import { getSession } from '@/lib/auth';

// GET all interaction types
export async function GET() {
  try {
    await connectDB();
    const interactionTypes = await InteractionType.find({}).sort({ order: 1 });
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
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.displayName) {
      return NextResponse.json(
        { error: 'Name and displayName are required' },
        { status: 400 }
      );
    }

    // Check if type already exists
    const existingType = await InteractionType.findOne({ name: data.name });
    if (existingType) {
      return NextResponse.json(
        { error: 'Interaction type with this name already exists' },
        { status: 400 }
      );
    }

    const interactionType = new InteractionType({
      ...data,
      createdBy: session.email,
      updatedBy: session.email
    });
    
    await interactionType.save();
    return NextResponse.json(interactionType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create interaction type' },
      { status: 500 }
    );
  }
}

// PUT update interaction type
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const interactionType = await InteractionType.findOne({ name: data.name });
    if (!interactionType) {
      return NextResponse.json(
        { error: 'Interaction type not found' },
        { status: 404 }
      );
    }

    // Update fields
    Object.assign(interactionType, {
      ...data,
      updatedBy: session.email
    });

    await interactionType.save();
    return NextResponse.json(interactionType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update interaction type' },
      { status: 500 }
    );
  }
}

// DELETE interaction type
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const interactionType = await InteractionType.findOne({ name });
    if (!interactionType) {
      return NextResponse.json(
        { error: 'Interaction type not found' },
        { status: 404 }
      );
    }

    // Check if type is in use
    const reportsUsingType = await Report.findOne({ interaction: name });
    if (reportsUsingType) {
      return NextResponse.json(
        { error: 'Cannot delete interaction type that is in use' },
        { status: 400 }
      );
    }

    await interactionType.deleteOne();
    return NextResponse.json({ message: 'Interaction type deleted successfully' });
  } catch (error) {
    console.error('Delete interaction type error:', error);
    return NextResponse.json(
      { error: 'Failed to delete interaction type' },
      { status: 500 }
    );
  }
} 