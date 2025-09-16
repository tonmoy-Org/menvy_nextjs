import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware, requireAdmin, AuthRequest } from '@/middleware/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const adminError = requireAdmin(req as AuthRequest);
    if (adminError) return adminError;

    const { name, email, password, role, phone, address } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'seller',
      phone,
      address,
    });

    await user.save();

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}