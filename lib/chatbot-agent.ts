import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Tool to get deals from database
export const getDealsTool = tool({
    name: "get_deals",
    description: "Get the latest deals and offers available. Use this when user asks about deals, offers, discounts, or products.",
    parameters: z.object({}),
    execute: async () => {
        try {
            const deals = await prisma.deal.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
            });

            if (deals.length === 0) {
                return JSON.stringify({
                    type: "text",
                    content: "No deals available at the moment. Please check back later!",
                });
            }

            return JSON.stringify({
                type: "deals",
                content: `Found ${deals.length} deals for you!`,
                deals: deals.map((deal) => ({
                    id: deal.id,
                    title: deal.title,
                    description: deal.description,
                    price: deal.price,
                    imageURL: deal.imageURL,
                })),
            });
        } catch (error) {
            console.error("Error fetching deals:", error);
            return JSON.stringify({
                type: "text",
                content: "Sorry, I couldn't fetch the deals right now. Please try again.",
            });
        }
    },
});

// Tool to get user's orders
export const getOrdersTool = tool({
    name: "get_orders",
    description: "Get the user's order history. Use this when user asks about their orders, purchases, or order status.",
    parameters: z.object({
        userId: z.string().describe("The user's ID"),
    }),
    execute: async ({ userId }) => {
        try {
            const orders = await prisma.order.findMany({
                where: { userId },
                take: 10,
                orderBy: { createdAt: "desc" },
                include: { payment: true },
            });

            if (orders.length === 0) {
                return JSON.stringify({
                    type: "text",
                    content: "You don't have any orders yet. Check out our deals to make your first purchase!",
                });
            }

            return JSON.stringify({
                type: "orders",
                content: `Found ${orders.length} orders in your history.`,
                orders: orders.map((order) => ({
                    id: order.id,
                    productName: order.productName,
                    imageURL: order.imageURL,
                    status: order.status,
                    createdAt: order.createdAt,
                    payment: order.payment
                        ? {
                            amountPaid: order.payment.amountPaid,
                            pendingAmount: order.payment.pendingAmount,
                        }
                        : null,
                })),
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            return JSON.stringify({
                type: "text",
                content: "Sorry, I couldn't fetch your orders right now. Please try again.",
            });
        }
    },
});

// Tool to get payment status
export const getPaymentStatusTool = tool({
    name: "get_payment_status",
    description: "Get the payment status for user's orders. Use this when user asks about payments, pending payments, or payment history.",
    parameters: z.object({
        userId: z.string().describe("The user's ID"),
    }),
    execute: async ({ userId }) => {
        try {
            const payments = await prisma.payment.findMany({
                where: {
                    order: { userId },
                },
                include: {
                    order: true,
                },
                orderBy: { createdAt: "desc" },
            });

            if (payments.length === 0) {
                return JSON.stringify({
                    type: "text",
                    content: "No payment records found. Make a purchase to see your payment history!",
                });
            }

            const totalPaid = payments.reduce((sum: number, p) => sum + p.amountPaid, 0);
            const totalPending = payments.reduce((sum: number, p) => sum + p.pendingAmount, 0);

            return JSON.stringify({
                type: "payments",
                content: `Payment Summary: ₹${totalPaid.toFixed(2)} paid, ₹${totalPending.toFixed(2)} pending.`,
                summary: {
                    totalPaid,
                    totalPending,
                    count: payments.length,
                },
                payments: payments.map((payment) => ({
                    id: payment.id,
                    orderId: payment.orderId,
                    productName: payment.order.productName,
                    amountPaid: payment.amountPaid,
                    pendingAmount: payment.pendingAmount,
                    createdAt: payment.createdAt,
                })),
            });
        } catch (error) {
            console.error("Error fetching payments:", error);
            return JSON.stringify({
                type: "text",
                content: "Sorry, I couldn't fetch your payment status right now. Please try again.",
            });
        }
    },
});

// Tool to get user profile
export const getUserProfileTool = tool({
    name: "get_user_profile",
    description: "Get the user's profile information. Use this when user asks about their profile, account details, or personal information.",
    parameters: z.object({
        userId: z.string().describe("The user's ID"),
    }),
    execute: async ({ userId }) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    _count: {
                        select: { orders: true, chats: true },
                    },
                },
            });

            if (!user) {
                return JSON.stringify({
                    type: "text",
                    content: "User profile not found.",
                });
            }

            return JSON.stringify({
                type: "profile",
                content: `Here's your profile information, ${user.name}!`,
                profile: {
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    address: user.address || "Not set",
                    ordersCount: user._count.orders,
                    chatsCount: user._count.chats,
                    memberSince: user.createdAt,
                },
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            return JSON.stringify({
                type: "text",
                content: "Sorry, I couldn't fetch your profile right now. Please try again.",
            });
        }
    },
});

// Create the main chatbot agent
export function createChatbotAgent(userId: string) {
    return new Agent({
        name: "SmartChatBot",
        instructions: `You are a helpful customer service chatbot for an e-commerce platform.
    
Your capabilities:
- Show product deals and offers using the get_deals tool
- Display user's order history using the get_orders tool
- Check payment status using the get_payment_status tool
- Show user profile using the get_user_profile tool

Guidelines:
1. Be friendly, helpful, and concise in your responses.
2. When users ask about deals, offers, or products - use the get_deals tool.
3. When users ask about their orders or order history - use the get_orders tool with userId: "${userId}".
4. When users ask about payments or pending payments - use the get_payment_status tool with userId: "${userId}".
5. When users ask about their profile or account - use the get_user_profile tool with userId: "${userId}".
6. Always use the appropriate tool to fetch real data instead of making up information.
7. Format your responses clearly and include relevant details.
8. If a tool returns no results, provide a helpful message suggesting what the user can do.

Remember: The current user's ID is "${userId}". Always pass this when calling tools that require userId.`,
        tools: [getDealsTool, getOrdersTool, getPaymentStatusTool, getUserProfileTool],
        model:"gpt-5-mini-2025-08-07"
    });
}
