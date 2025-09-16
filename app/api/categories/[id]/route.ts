import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { name, description } = await req.json();

    await connectDB();

    const category = await Category.findByIdAndUpdate(
      params.id,
      { name, description },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}