import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

// Generate bill number
function generateBillNo() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MV${timestamp}${random}`;
}

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const user = (req as AuthRequest).user;
    let query = {};

    // Sellers can only see their own sales
    if (user?.role === 'seller') {
      query = { seller: user.id };
    }

    const sales = await Sale.find(query)
      .populate('product', 'name sku')
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ sales });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch sales', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { productId, quantity, customerName, customerPhone, paymentMethod } = await req.json();

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    const user = (req as AuthRequest).user!;
    const billNo = generateBillNo();
    const total = product.price * quantity;

    const sale = new Sale({
      billNo,
      product: productId,
      productName: product.name,
      quantity,
      price: product.price,
      total,
      seller: user.id,
      sellerName: user.name,
      customer: {
        name: customerName,
        phone: customerPhone,
      },
      paymentMethod: paymentMethod || 'cash',
    });

    await sale.save();

    // Update product stock
    product.stock -= quantity;
    await product.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate('product', 'name sku')
      .populate('seller', 'name');

    return NextResponse.json({
      message: 'Sale recorded successfully',
      sale: populatedSale,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to record sale', details: error.message },
      { status: 500 }
    );
  }
}