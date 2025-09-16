import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import User from '@/models/User';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    for (let p of products) {
      p.category = p.category ? await Category.findById(p.category).select('name') : null;
      p.brand = p.brand ? await Brand.findById(p.brand).select('name') : null;
      p.createdBy = p.createdBy ? await User.findById(p.createdBy).select('name') : null;
    }




    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { name, description, category, brand, price, costPrice, stock, minStock, sku, size, color } = await req.json();

    if (!name || !category || !brand || !price || !costPrice || !sku) {
      return NextResponse.json(
        { error: 'Name, category, brand, price, cost price, and SKU are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      description,
      category,
      brand,
      price,
      costPrice,
      stock: stock || 0,
      minStock: minStock || 5,
      sku: sku.toUpperCase(),
      size,
      color,
      createdBy: (req as AuthRequest).user?.id,
    });

    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('createdBy', 'name');

    return NextResponse.json({
      message: 'Product created successfully',
      product: populatedProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}