import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const session = await getSession();

        if (session?.sessionId) {
            // Delete session from database
            await prisma.session.delete({
                where: { id: session.sessionId },
            }).catch(() => {
                // Session might already be deleted
            });
        }

        // Clear cookie
        await clearSessionCookie();

        return NextResponse.json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.error("Logout error:", error);
        // Still clear the cookie even if there's an error
        await clearSessionCookie();
        return NextResponse.json({ success: true });
    }
}
