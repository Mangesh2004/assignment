import { NextRequest } from "next/server";
import { run } from "@openai/agents";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createChatbotAgent } from "@/lib/chatbot-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getSession();
        if (!session) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const body = await request.json();
        const { message, chatId } = body;

        if (!message || typeof message !== "string") {
            return new Response(
                JSON.stringify({ error: "Message is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
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

        // Fetch chat history
        const historyMessages = await prisma.message.findMany({
            where: { chatId: chat.id },
            orderBy: { createdAt: "asc" },
            take: 8,
        });

        const historyContext = historyMessages.map((msg: any) => {
            const role = msg.role === "bot" ? "Assistant" : "User";
            let content = msg.content;
            if (content.length > 500) content = content.slice(0, 500) + "...";
            return `${role}: ${content}`;
        }).join("\n");

        // Build prompt
        let inputPrompt = message;
        if (historyContext) {
            inputPrompt = `Previous conversation:\n${historyContext}\n\nUser: ${message}`;
        }

        // Create agent
        const agent = createChatbotAgent(session.userId);

        // Create SSE stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Run agent with streaming
                    const result = await run(agent, inputPrompt, { stream: true });

                    let fullText = "";
                    let finalOutput: any = null;

                    // Stream text chunks and thinking events
                    for await (const event of result) {
                        // Log all events for debugging
                        console.log("Stream event:", JSON.stringify(event, null, 2));

                        if (event.type === "raw_model_stream_event") {
                            const data = event.data as any;

                            // Check multiple possible paths for text content
                            let textDelta = null;

                            // Path 1: data.delta.text (OpenAI format)
                            if (data?.delta?.text) {
                                textDelta = data.delta.text;
                            }
                            // Path 2: data.delta (direct string)
                            else if (typeof data?.delta === 'string') {
                                textDelta = data.delta;
                            }
                            // Path 3: output_text_delta event type
                            else if (data?.type === 'output_text_delta' && data?.delta) {
                                textDelta = data.delta;
                            }
                            // Path 4: content_block_delta (Anthropic/other format)
                            else if (data?.type === 'content_block_delta' && data?.delta?.text) {
                                textDelta = data.delta.text;
                            }
                            // Path 5: textDelta property (AI SDK format)
                            else if (data?.textDelta) {
                                textDelta = data.textDelta;
                            }
                            // Path 6: text property directly
                            else if (data?.text) {
                                textDelta = data.text;
                            }

                            if (textDelta) {
                                fullText += textDelta;
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({ type: "text", content: textDelta })}\n\n`)
                                );
                            }
                        } else if (event.type === "run_item_stream_event") {
                            const item = event.item as any;
                            // Stream tool calls as thinking events
                            if (item.type === "tool_call_item") {
                                const toolName = item.rawItem?.name || item.name || "tool";
                                const toolArgs = item.rawItem?.arguments || "";
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({
                                        type: "thinking",
                                        action: "tool_call",
                                        tool: toolName,
                                        args: toolArgs
                                    })}\n\n`)
                                );
                            } else if (item.type === "tool_call_output_item") {
                                // Tool completed - just send the thinking event
                                // Cards will be rendered from the streaming text-delta JSON
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({
                                        type: "thinking",
                                        action: "tool_result",
                                        result: "completed"
                                    })}\n\n`)
                                );
                            }
                        } else if (event.type === "agent_updated_stream_event") {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({
                                    type: "thinking",
                                    action: "agent_update",
                                    agent: event.agent?.name || "Agent"
                                })}\n\n`)
                            );
                        }
                    }

                    // Wait for completion and get final output
                    await result.completed;
                    finalOutput = result.finalOutput;

                    // Determine response type and metadata
                    let responseType = "text";
                    let responseContent = fullText || "";
                    let metadata: any = undefined;

                    if (typeof finalOutput === 'object' && finalOutput !== null && finalOutput.type) {
                        responseType = finalOutput.type;
                        responseContent = finalOutput.content || fullText || "";

                        if (finalOutput.type === "deals" && finalOutput.deals) {
                            metadata = { deals: finalOutput.deals };
                            if (!responseContent) responseContent = "Here are some deals for you:";
                        } else if (finalOutput.type === "orders" && finalOutput.orders) {
                            metadata = { orders: finalOutput.orders };
                            if (!responseContent) responseContent = "Here are your orders:";
                        } else if (finalOutput.type === "payments") {
                            metadata = { payments: finalOutput.payments, summary: finalOutput.summary };
                            if (!responseContent) responseContent = "Here is your payment information:";
                        } else if (finalOutput.type === "profile" && finalOutput.profile) {
                            metadata = { profile: finalOutput.profile };
                            if (!responseContent) responseContent = "Here is your profile:";
                        }

                        if (!responseContent) responseContent = "Here is the information you requested.";
                    }

                    // Generate temp ID for immediate response
                    const tempMessageId = crypto.randomUUID();

                    // Send final structured output IMMEDIATELY (non-blocking)
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            type: "done",
                            chatId: chat.id,
                            message: {
                                id: tempMessageId,
                                role: "bot",
                                content: responseContent,
                                type: responseType,
                                metadata: metadata,
                                createdAt: new Date().toISOString(),
                            }
                        })}\n\n`)
                    );

                    controller.close();

                    // Fire-and-forget: Save bot message to DB in background
                    prisma.message.create({
                        data: {
                            chatId: chat.id,
                            role: "bot",
                            content: responseContent,
                            type: responseType,
                            metadata: metadata ?? undefined,
                        },
                    }).catch((err) => {
                        console.error("Failed to save bot message:", err);
                    });
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Something went wrong" })}\n\n`)
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Stream setup error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to setup stream" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
