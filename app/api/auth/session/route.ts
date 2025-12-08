import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ authenticated: false });
        }

        // Verify session exists in database
        const dbSession = await prisma.session.findUnique({
            where: { id: session.sessionId },
            include: { user: true },
        });

        if (!dbSession || !dbSession.verified) {
            return NextResponse.json({ authenticated: false });
        }

        // Check if session is expired
        if (new Date() > dbSession.expiresAt) {
            await prisma.session.delete({ where: { id: session.sessionId } });
            return NextResponse.json({ authenticated: false });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: dbSession.user.id,
                name: dbSession.user.name,
                phone: dbSession.user.phone,
                email: dbSession.user.email,
            },
        });
    } catch (error) {
        console.error("Session check error:", error);
        return NextResponse.json({ authenticated: false });
    }
}
