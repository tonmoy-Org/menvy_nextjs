import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import { authMiddleware, requireAdmin, AuthRequest } from '@/middleware/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const adminError = requireAdmin(req as AuthRequest);
    if (adminError) return adminError;

    await connectDB();

    const purchase = await Purchase.findByIdAndDelete(params.id);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Purchase deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete purchase', details: error.message },
      { status: 500 }
    );
  }
}