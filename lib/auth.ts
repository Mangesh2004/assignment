import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-super-secret-jwt-key"
);

const TOKEN_NAME = "chatbot_session";

export interface SessionPayload {
    userId: string;
    sessionId: string;
    phone: string;
    exp?: number;
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
    const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(JWT_SECRET);

    return token;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as SessionPayload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) return null;

    return verifySessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
    });
}

export async function clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);
}

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry(): Date {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
}
