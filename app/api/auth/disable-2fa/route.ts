// app/api/auth/disable-2fa/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/lib/mongodb';
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    return NextResponse.json({ message: "2FA disabled successfully" });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}