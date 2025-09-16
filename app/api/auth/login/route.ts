import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';

export async function POST(req: NextRequest) {
  try {
    const { email, password, twoFactorCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get system settings
    const settings = await Settings.findOne();
    
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' },
        { status: 423 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check 2FA if enabled
    if (settings?.twoFactorAuth && user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { 
            error: '2FA code required', 
            requiresTwoFactor: true,
            userId: user._id.toString()
          },
          { status: 200 }
        );
      }
      
      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorCode,
        window: 1
      });
      
      if (!verified) {
        await user.incLoginAttempts();
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        );
      }
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create JWT with session timeout from settings
    const sessionTimeout = settings?.sessionTimeout || 24;
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: `${sessionTimeout}h` }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}