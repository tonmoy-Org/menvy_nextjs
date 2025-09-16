import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware, requireAdmin, AuthRequest } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const adminError = requireAdmin(req as AuthRequest);
    if (adminError) return adminError;

    await connectDB();

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const adminError = requireAdmin(req as AuthRequest);
    if (adminError) return adminError;

    const { userId, role, isActive } = await req.json();

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { role, isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}