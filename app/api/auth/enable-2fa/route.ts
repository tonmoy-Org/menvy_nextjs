import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import connectDB from '@/lib/mongodb';
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const secret = speakeasy.generateSecret({
      name: `Menvy: ${user.email}`,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    return NextResponse.json({
      message: "2FA setup initiated",
      qrCodeUrl,
      secret: secret.base32,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
