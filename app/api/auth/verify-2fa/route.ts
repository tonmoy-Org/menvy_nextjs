// app/api/auth/verify-2fa/route.ts
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { userId, token } = body;

        const user = await User.findById(userId);
        if (!user || !user.twoFactorSecret) {
            return NextResponse.json(
                { error: "User not found or 2FA not initiated" },
                { status: 404 }
            );
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
        });

        if (!verified) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        user.twoFactorEnabled = true;
        await user.save();

        return NextResponse.json({ message: "2FA enabled successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
