import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authMiddleware, AuthRequest } from '@/middleware/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { name, phone, address, role, isActive, currentPassword, newPassword } = await req.json();
    const currentUser = (req as AuthRequest).user;

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user can update this profile
    if (currentUser?.role !== 'admin' && currentUser?.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this profile' },
        { status: 403 }
      );
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // Only admin can change role and status
    if (currentUser?.role === 'admin') {
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const updatedUser = await User.findById(params.id).select('-password');

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const currentUser = (req as AuthRequest).user;
    
    // Only admin can delete users
    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}