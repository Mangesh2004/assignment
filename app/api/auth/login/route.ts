import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry, createSessionToken } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";

// Check phone and send OTP
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            return NextResponse.json(
                { error: "Invalid phone number. Must be 10 digits." },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            // User not found - needs registration
            return NextResponse.json({
                exists: false,
                message: "User not found. Please register.",
            });
        }

        // User exists - generate OTP and create session
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Create a pending session
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                token: `pending_${Date.now()}`,
                otp,
                otpExpiry,
                verified: false,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });

        // Send OTP email
        const emailSent = await sendOTPEmail(user.email, otp, user.name);

        if (!emailSent) {
            // Clean up session if email fails
            await prisma.session.delete({ where: { id: session.id } });
            return NextResponse.json(
                { error: "Failed to send OTP email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            exists: true,
            sessionId: session.id,
            message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
