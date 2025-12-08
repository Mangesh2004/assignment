import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry, createSessionToken, setSessionCookie } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, phone, email, address } = body;

        // Validation
        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Name must be at least 2 characters." },
                { status: 400 }
            );
        }

        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            return NextResponse.json(
                { error: "Invalid phone number. Must be 10 digits." },
                { status: 400 }
            );
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address." },
                { status: 400 }
            );
        }

        // Check if phone already exists
        const existingPhone = await prisma.user.findUnique({
            where: { phone },
        });

        if (existingPhone) {
            return NextResponse.json(
                { error: "Phone number already registered. Please login." },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: "Email already registered. Please use a different email." },
                { status: 400 }
            );
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                phone,
                email: email.toLowerCase().trim(),
                address: address?.trim() || null,
            },
        });

        // Generate OTP and create session
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                token: `pending_${Date.now()}`,
                otp,
                otpExpiry,
                verified: false,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        // Send OTP email
        const emailSent = await sendOTPEmail(user.email, otp, user.name);

        if (!emailSent) {
            // Don't delete user, just inform about email issue
            return NextResponse.json({
                success: true,
                sessionId: session.id,
                userId: user.id,
                emailSent: false,
                message: "Account created! However, we couldn't send the OTP email. Please try to login again.",
            });
        }

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            userId: user.id,
            emailSent: true,
            message: `Welcome ${user.name}! OTP sent to ${email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
