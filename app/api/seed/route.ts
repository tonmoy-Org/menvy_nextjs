import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@menvy.store' });
    const existingSeller = await User.findOne({ email: 'seller@menvy.store' });

    if (existingAdmin && existingSeller) {
      return NextResponse.json({
        message: 'Demo users already exist',
        users: [
          { email: 'admin@menvy.store', role: 'admin' },
          { email: 'seller@menvy.store', role: 'seller' }
        ]
      });
    }

    const createdUsers = [];

    // Create admin user
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@menvy.store',
        password: 'admin123',
        role: 'admin',
        phone: '01708-446607',
        address: 'Magura, Bangladesh',
        isActive: true,
      });

      await adminUser.save();
      createdUsers.push({ email: 'admin@menvy.store', role: 'admin' });
    }

    // Create seller user
    if (!existingSeller) {
      const sellerUser = new User({
        name: 'Seller User',
        email: 'seller@menvy.store',
        password: 'seller123',
        role: 'seller',
        phone: '01708-446608',
        address: 'Magura, Bangladesh',
        isActive: true,
      });

      await sellerUser.save();
      createdUsers.push({ email: 'seller@menvy.store', role: 'seller' });
    }

    return NextResponse.json({
      message: 'Demo users created successfully',
      users: createdUsers,
      credentials: {
        admin: 'admin@menvy.store / admin123',
        seller: 'seller@menvy.store / seller123'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to seed users', details: error.message },
      { status: 500 }
    );
  }
}