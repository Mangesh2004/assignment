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

        // ---------------------------------------------------------
        // Fetch Chat History (Context) - include in prompt
        // ---------------------------------------------------------
        const historyMessages = await prisma.message.findMany({
            where: { chatId: chat.id },
            orderBy: { createdAt: "asc" },
            take: 8, // Limit history to last 8 messages
        });

        // Format history as a context string for the agent
        const historyContext = historyMessages.map((msg: any) => {
            const role = msg.role === "bot" ? "Assistant" : "User";
            // Truncate long content to save tokens and prevent confusion
            let content = msg.content;
            if (content.length > 500) content = content.slice(0, 500) + "... (truncated)";
            return `${role}: ${content}`;
        }).join("\n");

        // ---------------------------------------------------------
        // STRATEGY: Pre-extract price parameters from user message
        // This is more reliable than relying on LLM to parse prices
        // ---------------------------------------------------------
        function extractPriceHints(msg: string): string {
            const lowerMsg = msg.toLowerCase();
            let minPrice = 0;
            let maxPrice = 0;

            // Pattern: "below/under/less than X" or "< X"
            const belowMatch = lowerMsg.match(/(?:below|under|less\s*than|cheaper\s*than|<)\s*(?:rs\.?|₹|inr)?\s*(\d+)/i);
            if (belowMatch) {
                maxPrice = parseInt(belowMatch[1], 10);
            }

            // Pattern: "above/over/more than X" or "> X"
            const aboveMatch = lowerMsg.match(/(?:above|over|more\s*than|greater\s*than|>)\s*(?:rs\.?|₹|inr)?\s*(\d+)/i);
            if (aboveMatch) {
                minPrice = parseInt(aboveMatch[1], 10);
            }

            // Pattern: "between X and Y" or "X to Y" or "X-Y"
            const betweenMatch = lowerMsg.match(/(?:between|from)?\s*(?:rs\.?|₹|inr)?\s*(\d+)\s*(?:to|and|-)\s*(?:rs\.?|₹|inr)?\s*(\d+)/i);
            if (betweenMatch && !belowMatch && !aboveMatch) {
                minPrice = parseInt(betweenMatch[1], 10);
                maxPrice = parseInt(betweenMatch[2], 10);
            }

            // Build hint string if prices were extracted
            if (minPrice > 0 || maxPrice > 0) {
                return `\n\n[SYSTEM HINT: Extracted price filters from user message - minPrice=${minPrice}, maxPrice=${maxPrice}. Use these values when calling get_deals tool.]`;
            }
            return "";
        }

        const priceHints = extractPriceHints(message);

        // Create agent with history context
        const agent = createChatbotAgent(session.userId);

        // Build the input prompt with history context and price hints
        let inputPrompt = message;
        if (historyContext) {
            inputPrompt = `Previous conversation:\n${historyContext}\n\nUser: ${message}`;
        }
        inputPrompt += priceHints;

        console.log("Agent Input:", inputPrompt);

        // ---------------------------------------------------------
        // VALIDATION & RETRY LOOP
        // ---------------------------------------------------------
        const MAX_RETRIES = 3;
        let attempt = 0;
        let currentPrompt = inputPrompt;
        let finalResult: any = null;

        while (attempt < MAX_RETRIES) {
            attempt++;
            console.log(`Attempt ${attempt}/${MAX_RETRIES}`);

            const result = await run(agent, currentPrompt);
            const output = result.finalOutput as any;

            // Validation Logic
            let isValid = true;
            let failureReason = "";

            if (!output || typeof output !== 'object') {
                isValid = false;
                failureReason = "Output must be a valid JSON object.";
            } else if (output.type === 'deals' && (!output.deals || output.deals.length === 0)) {
                isValid = false;
                failureReason = "Type is 'deals' but the 'deals' list is empty. If no deals were found, usage type='text' and say so. If deals WERE found, ensure the 'deals' array is populated.";
            } else if (output.type === 'orders' && (!output.orders || output.orders.length === 0)) {
                isValid = false;
                failureReason = "Type is 'orders' but 'orders' list is empty.";
            } else if (output.type === 'payments' && (!output.payments || output.payments.length === 0)) {
                isValid = false;
                failureReason = "Type is 'payments' but 'payments' list is empty.";
            } else if (output.type === 'profile' && !output.profile) {
                isValid = false;
                failureReason = "Type is 'profile' but 'profile' object is missing.";
            } else if (output.type === 'text') {
                // Hallucination Check: Did we talk about showing something but forgot the type?
                const contentLower = (output.content || "").toLowerCase();
                if (contentLower.includes("here are the deals") || contentLower.includes("found these deals") || contentLower.includes("check out these products")) {
                    isValid = false;
                    failureReason = "You said 'Here are the deals' (or similar) but set type='text'. You MUST set type='deals' and populate the 'deals' array to render the cards.";
                } else if (contentLower.includes("here are your orders") || contentLower.includes("recent orders")) {
                    isValid = false;
                    failureReason = "You said 'Here are your orders' but set type='text'. You MUST set type='orders'.";
                }
            }

            if (isValid) {
                finalResult = output;
                break;
            }

            console.warn(`Attempt ${attempt} failed validation: ${failureReason}`);

            // Feedback for next loop
            currentPrompt += `\n\n[SYSTEM ERROR]: Your previous response was INVALID. Reason: "${failureReason}". \nIMPORTANT: You MUST correct this. Ensure strict adherence to the Output Schema. Do not apologize, just return the Correct JSON.`;
        }

        // If all retries fail, fallback to a safe error text
        const output = finalResult || {
            type: "text",
            content: "I'm having trouble retrieving that information in the correct format right now. Please try again."
        };

        let responseContent = "";
        let responseType = "text";
        let metadata: any = undefined;

        console.log("Agent Final Output:", JSON.stringify(output, null, 2));

        if (typeof output === 'object' && output !== null && output.type) {
            responseType = output.type;
            responseContent = output.content || "";

            if (output.type === "deals" && output.deals) {
                metadata = { deals: output.deals };
                if (!responseContent) responseContent = "Here are some deals for you:";
            } else if (output.type === "orders" && output.orders) {
                metadata = { orders: output.orders };
                if (!responseContent) responseContent = "Here are your orders:";
            } else if (output.type === "payments") {
                metadata = { payments: output.payments, summary: output.summary };
                if (!responseContent) responseContent = "Here is your payment information:";
            } else if (output.type === "profile" && output.profile) {
                metadata = { profile: output.profile };
                if (!responseContent) responseContent = "Here is your profile:";
            }

            // Fallback if still empty
            if (!responseContent) responseContent = "Here is the information you requested.";
        } else {
            // Fallback for string output (should not happen with strict outputType)
            responseContent = typeof output === 'string' ? output : "Processing complete.";
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

// Delete a chat with all its messages
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get("chatId");

        if (!chatId) {
            return NextResponse.json(
                { error: "Chat ID is required" },
                { status: 400 }
            );
        }

        // Verify ownership and delete
        // onDelete: Cascade in schema handles message deletion automatically, 
        // but we verify ownership first for security.
        const chat = await prisma.chat.findUnique({
            where: { id: chatId, userId: session.userId },
        });

        if (!chat) {
            return NextResponse.json(
                { error: "Chat not found or unauthorized" },
                { status: 404 }
            );
        }

        await prisma.chat.delete({
            where: { id: chatId },
        });

        return NextResponse.json({ success: true, deletedId: chatId });

    } catch (error) {
        console.error("Delete chat error:", error);
        return NextResponse.json(
            { error: "Failed to delete chat" },
            { status: 500 }
        );
    }
}
