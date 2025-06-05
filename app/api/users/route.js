import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// Get all users
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find().select('-password');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new user
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const user = await User.create(data);
    const userWithoutPassword = await User.findById(user._id).select('-password');
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 