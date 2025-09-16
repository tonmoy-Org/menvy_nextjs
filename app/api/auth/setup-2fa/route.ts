import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { authMiddleware, AuthRequest } from '@/middleware/auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    const settings = await Settings.findOne();
    if (!settings?.twoFactorAuth) {
      return NextResponse.json(
        { error: '2FA is not enabled in system settings' },
        { status: 400 }
      );
    }

    const user = await User.findById((req as AuthRequest).user?.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate secret for 2FA
    const secret = speakeasy.generateSecret({
      name: `${settings.storeName} (${user.email})`,
      issuer: settings.storeName,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Save secret to user (but don't enable 2FA yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    return NextResponse.json({
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32,
      manualEntryKey: secret.base32,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to setup 2FA', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: '2FA token is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById((req as AuthRequest).user?.id);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'User not found or 2FA not initiated' },
        { status: 404 }
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid 2FA token' },
        { status: 400 }
      );
    }

    // Enable 2FA for the user
    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({
      message: '2FA enabled successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to verify 2FA', details: error.message },
      { status: 500 }
    );
  }
}