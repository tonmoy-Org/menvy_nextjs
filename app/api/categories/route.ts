import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = new Category({ name, description });
    await category.save();

    return NextResponse.json({
      message: 'Category created successfully',
      category,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create category', details: error.message },
      { status: 500 }
    );
  }
}