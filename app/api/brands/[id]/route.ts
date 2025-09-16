import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { name, description } = await req.json();

    await connectDB();

    const brand = await Brand.findByIdAndUpdate(
      params.id,
      { name, description },
      { new: true }
    );

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Brand updated successfully',
      brand,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update brand', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const brand = await Brand.findByIdAndDelete(params.id);

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Brand deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete brand', details: error.message },
      { status: 500 }
    );
  }
}