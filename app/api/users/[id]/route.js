import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import User from '@/lib/models/User';

// Get user by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, email, isAdmin, isActive, password } = await request.json();
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-modification of admin status
    if (user.email === session.email && isAdmin !== user.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot modify your own admin status' },
        { status: 400 }
      );
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.isAdmin = isAdmin;
    user.isActive = isActive;

    // Update password if provided
    if (password) {
      user.password = password; // The pre-save hook will hash this
    }

    await user.save();
    const updatedUser = await User.findById(params.id).select('-password');
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-deletion
    if (user.email === session.email) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user role
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin } = await request.json();
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-modification of admin status
    if (user.email === session.email) {
      return NextResponse.json(
        { error: 'Cannot modify your own admin status' },
        { status: 400 }
      );
    }

    user.isAdmin = isAdmin;
    await user.save();
    
    const updatedUser = await User.findById(params.id).select('-password');
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 