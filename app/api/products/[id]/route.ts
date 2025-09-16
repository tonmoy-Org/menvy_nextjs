// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { authMiddleware, AuthRequest } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const body = await req.json();
    const {
      name,
      description,
      category,
      brand,
      price,
      costPrice,
      stock,
      minStock,
      sku,
      size,
      color,
    } = body;

    await connectDB();

    // Build update object safely
    const updateData: any = {
      name,
      description,
      price,
      costPrice,
      stock,
      minStock,
      sku: sku?.toUpperCase(),
      size,
      color,
    };

    // Only add category if valid
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      updateData.category = category;
    }

    // Only add brand if valid
    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      updateData.brand = brand;
    }

    const product = await Product.findByIdAndUpdate(params.id, updateData, { new: true })
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('createdBy', 'name');

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}
