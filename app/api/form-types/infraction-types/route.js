import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InfractionType from '@/lib/models/InfractionType';
import { getSession } from '@/lib/auth';

// GET all infraction types
export async function GET() {
  try {
    await connectDB();
    const infractionTypes = await InfractionType.find({}).sort({ order: 1 });
    return NextResponse.json(infractionTypes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch infraction types' },
      { status: 500 }
    );
  }
}

// POST new infraction type
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
    const existingType = await InfractionType.findOne({ name: data.name });
    if (existingType) {
      return NextResponse.json(
        { error: 'Infraction type with this name already exists' },
        { status: 400 }
      );
    }

    const infractionType = new InfractionType({
      ...data,
      createdBy: session.email,
      updatedBy: session.email
    });
    
    await infractionType.save();
    return NextResponse.json(infractionType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create infraction type' },
      { status: 500 }
    );
  }
}

// PUT update infraction type
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

    const infractionType = await InfractionType.findOne({ name: data.name });
    if (!infractionType) {
      return NextResponse.json(
        { error: 'Infraction type not found' },
        { status: 404 }
      );
    }

    // Update fields
    Object.assign(infractionType, {
      ...data,
      updatedBy: session.email
    });

    await infractionType.save();
    return NextResponse.json(infractionType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update infraction type' },
      { status: 500 }
    );
  }
}

// DELETE infraction type
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

    const infractionType = await InfractionType.findOne({ name });
    if (!infractionType) {
      return NextResponse.json(
        { error: 'Infraction type not found' },
        { status: 404 }
      );
    }

    // Check if type is in use
    const Report = mongoose.model('Report');
    const reportsUsingType = await Report.findOne({ infraction: name });
    if (reportsUsingType) {
      return NextResponse.json(
        { error: 'Cannot delete infraction type that is in use' },
        { status: 400 }
      );
    }

    await infractionType.deleteOne();
    return NextResponse.json({ message: 'Infraction type deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete infraction type' },
      { status: 500 }
    );
  }
} 