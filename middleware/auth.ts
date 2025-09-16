import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings';

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export async function authMiddleware(req: AuthRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get settings for session timeout
    await connectDB();
    const settings = await Settings.findOne();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json({ 
        error: 'Account is temporarily locked due to too many failed login attempts' 
      }, { status: 423 });
    }

    // Check token expiration based on settings
    const tokenAge = Math.floor((Date.now() - decoded.iat * 1000) / (1000 * 60 * 60)); // hours
    const sessionTimeout = settings?.sessionTimeout || 24;
    
    if (tokenAge > sessionTimeout) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return null;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export function requireAdmin(req: AuthRequest) {
  if (req.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return null;
}