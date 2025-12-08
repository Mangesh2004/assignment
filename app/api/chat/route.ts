import { NextRequest, NextResponse } from "next/server";
import { run } from "@openai/agents";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createChatbotAgent } from "@/lib/chatbot-agent";


export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please login first." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { message, chatId } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        // Get or create chat
        let chat;
        if (chatId) {
            chat = await prisma.chat.findUnique({
                where: { id: chatId, userId: session.userId },
            });
        }

        if (!chat) {
            // Create new chat
            chat = await prisma.chat.create({
                data: {
                    userId: session.userId,
                    title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
                },
            });
        }

        // Save user message
        await prisma.message.create({
            data: {
                chatId: chat.id,
                role: "user",
                content: message,
                type: "text",
            },
        });

        // Create agent and run
        const agent = createChatbotAgent(session.userId);
        const result = await run(agent, message);

        // Parse the response to check if it's a structured response from tools
        let responseContent = result.finalOutput || "I'm sorry, I couldn't process your request.";
        let responseType = "text";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let metadata: any = undefined;

        try {
            // Check if the response is a JSON string from a tool
            const parsed = JSON.parse(responseContent);
            if (parsed.type) {
                responseType = parsed.type;
                responseContent = parsed.content;
                if (parsed.deals) {
                    metadata = { deals: parsed.deals };
                } else if (parsed.orders) {
                    metadata = { orders: parsed.orders };
                } else if (parsed.payments) {
                    metadata = { payments: parsed.payments, summary: parsed.summary };
                } else if (parsed.profile) {
                    metadata = { profile: parsed.profile };
                }
            }
        } catch {
            // Response is plain text, use as-is
        }

        // Save bot message
        const botMessage = await prisma.message.create({
            data: {
                chatId: chat.id,
                role: "bot",
                content: responseContent,
                type: responseType,
                metadata: metadata ?? undefined,
            },
        });

        return NextResponse.json({
            success: true,
            chatId: chat.id,
            message: {
                id: botMessage.id,
                role: "bot",
                content: responseContent,
                type: responseType,
                metadata: metadata,
                createdAt: botMessage.createdAt,
            },
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

// Get chat history
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please login first." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get("chatId");

        if (chatId) {
            // Get specific chat messages
            const messages = await prisma.message.findMany({
                where: { chatId, chat: { userId: session.userId } },
                orderBy: { createdAt: "asc" },
            });

            return NextResponse.json({ messages });
        }

        // Get all chats
        const chats = await prisma.chat.findMany({
            where: { userId: session.userId },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { messages: true },
                },
            },
        });

        return NextResponse.json({ chats });
    } catch (error) {
        console.error("Get chat error:", error);
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}
