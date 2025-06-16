import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InterventionType from '@/lib/models/InterventionType';
import { getSession } from '@/lib/auth';

// GET all intervention types
export async function GET() {
  try {
    await connectDB();
    const interventionTypes = await InterventionType.find({}).sort({ order: 1 });
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
    const existingType = await InterventionType.findOne({ name: data.name });
    if (existingType) {
      return NextResponse.json(
        { error: 'Intervention type with this name already exists' },
        { status: 400 }
      );
    }

    const interventionType = new InterventionType({
      ...data,
      createdBy: session.email,
      updatedBy: session.email
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

    const interventionType = await InterventionType.findOne({ name: data.name });
    if (!interventionType) {
      return NextResponse.json(
        { error: 'Intervention type not found' },
        { status: 404 }
      );
    }

    // Update fields
    Object.assign(interventionType, {
      ...data,
      updatedBy: session.email
    });

    await interventionType.save();
    return NextResponse.json(interventionType);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update intervention type' },
      { status: 500 }
    );
  }
}

// DELETE intervention type
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

    const interventionType = await InterventionType.findOne({ name });
    if (!interventionType) {
      return NextResponse.json(
        { error: 'Intervention type not found' },
        { status: 404 }
      );
    }

    // Check if type is in use
    const Report = mongoose.model('Report');
    const reportsUsingType = await Report.findOne({ intervention: name });
    if (reportsUsingType) {
      return NextResponse.json(
        { error: 'Cannot delete intervention type that is in use' },
        { status: 400 }
      );
    }

    await interventionType.deleteOne();
    return NextResponse.json({ message: 'Intervention type deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete intervention type' },
      { status: 500 }
    );
  }
} 