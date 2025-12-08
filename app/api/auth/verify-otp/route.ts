import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, otp } = body;

        if (!sessionId || !otp) {
            return NextResponse.json(
                { error: "Session ID and OTP are required." },
                { status: 400 }
            );
        }

        // Find the session
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { user: true },
        });

        if (!session) {
            return NextResponse.json(
                { error: "Session not found. Please try again." },
                { status: 404 }
            );
        }

        // Check if already verified
        if (session.verified) {
            return NextResponse.json(
                { error: "Session already verified." },
                { status: 400 }
            );
        }

        // Check OTP expiry
        if (!session.otpExpiry || new Date() > session.otpExpiry) {
            await prisma.session.delete({ where: { id: sessionId } });
            return NextResponse.json(
                { error: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Verify OTP
        if (session.otp !== otp) {
            return NextResponse.json(
                { error: "Invalid OTP. Please try again." },
                { status: 400 }
            );
        }

        // OTP verified - create JWT token
        const token = await createSessionToken({
            userId: session.userId,
            sessionId: session.id,
            phone: session.user.phone,
        });

        // Update session
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                verified: true,
                token,
                otp: null, // Clear OTP after verification
                otpExpiry: null,
            },
        });

        // Set cookie
        await setSessionCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: session.user.id,
                name: session.user.name,
                phone: session.user.phone,
                email: session.user.email,
            },
            message: "Login successful!",
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
