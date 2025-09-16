import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import Product from '@/models/Product';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

// Generate purchase number
function generatePurchaseNo() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PUR${timestamp}${random}`;
}

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const purchases = await Purchase.find({})
      .populate('product', 'name sku')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ purchases });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch purchases', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { productId, quantity, costPrice, supplierName, supplierPhone, supplierAddress } = await req.json();

    if (!productId || !quantity || !costPrice || !supplierName) {
      return NextResponse.json(
        { error: 'Product ID, quantity, cost price, and supplier name are required' },
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

    const user = (req as AuthRequest).user!;
    const purchaseNo = generatePurchaseNo();
    const total = costPrice * quantity;

    const purchase = new Purchase({
      purchaseNo,
      product: productId,
      productName: product.name,
      quantity,
      costPrice,
      total,
      supplier: {
        name: supplierName,
        phone: supplierPhone,
        address: supplierAddress,
      },
      createdBy: user.id,
      createdByName: user.name,
    });

    await purchase.save();

    // Update product stock and cost price
    product.stock += quantity;
    product.costPrice = costPrice;
    await product.save();

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('product', 'name sku')
      .populate('createdBy', 'name');

    return NextResponse.json({
      message: 'Purchase recorded successfully',
      purchase: populatedPurchase,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to record purchase', details: error.message },
      { status: 500 }
    );
  }
}