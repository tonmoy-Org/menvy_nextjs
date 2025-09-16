import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const brands = await Brand.find({ isActive: true })
      .sort({ name: 1 });

    return NextResponse.json({ brands });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch brands', details: error.message },
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
        { error: 'Brand name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand with this name already exists' },
        { status: 400 }
      );
    }

    const brand = new Brand({ name, description });
    await brand.save();

    return NextResponse.json({
      message: 'Brand created successfully',
      brand,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create brand', details: error.message },
      { status: 500 }
    );
  }
}