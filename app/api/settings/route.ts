import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { authMiddleware, requireAdmin, AuthRequest } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    await connectDB();

    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new Settings({});
      await settings.save();
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authError = await authMiddleware(req as AuthRequest);
    if (authError) return authError;

    const adminError = requireAdmin(req as AuthRequest);
    if (adminError) return adminError;

    const newSettings = await req.json();

    await connectDB();

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(newSettings);
    } else {
      // Update existing settings
      Object.keys(newSettings).forEach(key => {
        if (key === 'businessHours' && typeof newSettings[key] === 'object') {
          settings.businessHours = { ...settings.businessHours, ...newSettings[key] };
        } else {
          settings[key] = newSettings[key];
        }
      });
    }

    await settings.save();

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update settings', details: error.message },
      { status: 500 }
    );
  }
}