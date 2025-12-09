
import { Agent, tool, setTracingDisabled } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "./embeddings";



// Tool to get deals from database with detailed search
// Using string type with "NULL" for unspecified values - clearer for LLM
export const getDealsTool = tool({
    name: "get_deals",
    description: "Get the latest deals or search for specific products. Supports filtering by price range.",
    parameters: z.object({
        query: z.string().default("").describe("Search keyword (e.g. 'phone', 'speakers', 'electronics'). Empty string for all deals."),
        minPrice: z.string().default("NULL").describe("Minimum price filter. Use 'NULL' if user did not specify a minimum price. Use a number string like '1000' if specified."),
        maxPrice: z.string().default("NULL").describe("Maximum price filter. Use 'NULL' if user did not specify a maximum price. Use a number string like '1000' if specified."),
        limit: z.number().default(4).describe("Number of results to return."),
    }),
    execute: async ({ query, minPrice, maxPrice, limit }) => {
        try {
            // Parse price strings - treat "NULL", "null", empty, or non-numeric as no filter
            const parsePrice = (val: string): number | null => {
                if (!val || val.toUpperCase() === "NULL" || val.trim() === "") return null;
                const num = parseInt(val, 10);
                return isNaN(num) || num <= 0 ? null : num;
            };

            const minPriceNum = parsePrice(minPrice);
            const maxPriceNum = parsePrice(maxPrice);

            console.log(`Searching: Query="${query || 'ALL'}" | MinPrice=${minPriceNum ?? 'NULL'} | MaxPrice=${maxPriceNum ?? 'NULL'} | Limit=${limit}`);

            let deals: any[] = [];

            if (query && query.trim() !== "") {
                // --- VECTOR SEARCH ---
                console.log("Generating embedding for query:", query);
                const embedding = await generateEmbedding(query);
                const vectorString = JSON.stringify(embedding);

                // Default price bounds for SQL if not specified
                const effectiveMin = minPriceNum ?? 0;
                const effectiveMax = maxPriceNum ?? 99999999;

                // Use Raw SQL for pgvector similarity search (<=> operator)
                // Selects fields and orders by semantic distance
                // Use Raw SQL for pgvector similarity search (<=> operator)
                // Selects fields and orders by semantic distance
                // Adding a manual timeout race to prevent indefinite hanging
                const vectorSearchPromise = prisma.$queryRaw`
                    SELECT id, title, description, price, "imageURL"
                    FROM "Deal"
                    WHERE price >= ${effectiveMin}
                      AND price <= ${effectiveMax}
                    ORDER BY embedding <=> ${vectorString}::vector
                    LIMIT ${limit};
                `;

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Database query timed out")), 5000)
                );

                deals = await Promise.race([vectorSearchPromise, timeoutPromise]) as any[];
            } else {
                // --- STANDARD FILTER (Latest Deals) ---
                const whereClause: any = {};
                // Price Range Filter
                if (minPriceNum !== null || maxPriceNum !== null) {
                    whereClause.price = {};
                    if (minPriceNum !== null) whereClause.price.gte = minPriceNum;
                    if (maxPriceNum !== null) whereClause.price.lte = maxPriceNum;
                }

                deals = await prisma.deal.findMany({
                    where: whereClause,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                });
            }

            if (deals.length === 0) {
                return JSON.stringify({
                    type: "text",
                    content: "No deals found matching your criteria. Try a different search or price range.",
                });
            }

            return JSON.stringify({
                type: "deals",
                content: `Found ${deals.length} deals for you!`,
                deals: deals.map((deal: any) => ({
                    id: deal.id,
                    title: deal.title,
                    description: deal.description,
                    price: deal.price,
                    imageURL: deal.imageURL,
                })),
            });
        } catch (error) {
            console.error("Error fetching deals:", error);
            return JSON.stringify({ type: "text", content: "Error fetching deals." });
        }
    },
});

// Tool to place an order
export const placeOrderTool = tool({
    name: "place_order",
    description: "Place an order for a specific deal. Use when user explicitly wants to buy/order something.",
    parameters: z.object({
        userId: z.string().describe("User ID"),
        dealId: z.string().describe("The ID of the deal/product to order. MUST be a valid ID from a previous deal search."),
    }),
    execute: async ({ userId, dealId }) => {
        try {
            const deal = await prisma.deal.findUnique({ where: { id: dealId } });
            if (!deal) return JSON.stringify({ type: "text", content: "Deal not found or invalid Deal ID." });

            const order = await prisma.order.create({
                data: {
                    userId,
                    productName: deal.title,
                    imageURL: deal.imageURL,
                    status: "confirmed", // Order created
                }
            });

            // RETURN AS "orders" TYPE so frontend renders card
            return JSON.stringify({
                type: "orders",
                content: `Order placed successfully!`,
                orders: [{
                    id: order.id,
                    productName: order.productName,
                    status: order.status,
                    imageURL: order.imageURL,
                }]
            });
        } catch (error) {
            console.error("Error placing order:", error);
            return JSON.stringify({ type: "text", content: "Failed to place order. Please try again." });
        }
    },
});

// Tool to get user's orders
export const getOrdersTool = tool({
    name: "get_orders",
    description: "Get the user's order history.",
    parameters: z.object({
        userId: z.string().describe("The user's ID"),
    }),
    execute: async ({ userId }) => {
        try {
            const orders = await prisma.order.findMany({
                where: { userId },
                take: 5, // Limit to 5 for better UI
                orderBy: { createdAt: "desc" },
            });

            if (orders.length === 0) {
                return JSON.stringify({
                    type: "text",
                    content: "You don't have any orders yet.",
                });
            }

            return JSON.stringify({
                type: "orders",
                content: `Here are your recent orders:`,
                orders: orders.map((order: any) => {
                    return {
                        id: order.id,
                        productName: order.productName,
                        status: order.status,
                        imageURL: order.imageURL,
                        paymentUrl: "" // No payment flow
                    };
                }),
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            return JSON.stringify({ type: "text", content: "Error fetching orders." });
        }
    },
});

// Tool to get payment status
export const getPaymentStatusTool = tool({
    name: "get_payment_status",
    description: "Get payment status summary.",
    parameters: z.object({ userId: z.string() }),
    execute: async ({ userId }) => {
        try {
            const payments = await prisma.payment.findMany({
                where: { order: { userId } },
                include: { order: true },
                orderBy: { createdAt: "desc" },
                take: 5
            });

            if (payments.length === 0) return JSON.stringify({ type: "text", content: "No payments found." });

            const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amountPaid, 0);
            const totalPending = payments.reduce((sum: number, p: any) => sum + p.pendingAmount, 0);

            return JSON.stringify({
                type: "payments",
                content: `Here is your payment summary.`,
                summary: { totalPaid, totalPending, count: payments.length },
                payments: payments.map((p: any) => ({
                    id: p.id,
                    amountPaid: p.amountPaid,
                    pendingAmount: p.pendingAmount,
                    orderId: p.orderId,
                    productName: p.order.productName,
                    createdAt: p.createdAt.toISOString(),
                })),
            });
        } catch (e) { return JSON.stringify({ type: "text", content: "Error fetching payments." }); }
    },
});

// Tool to get user profile details
export const getUserProfileTool = tool({
    name: "get_user_profile",
    description: "Get user profile details.",
    parameters: z.object({ userId: z.string() }),
    execute: async ({ userId }) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { _count: { select: { orders: true, chats: true } } },
            });
            if (!user) return JSON.stringify({ type: "text", content: "Profile not found." });
            return JSON.stringify({
                type: "profile",
                content: `Here is your profile detail.`,
                profile: {
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    address: user.address || "Not set",
                    ordersCount: user._count.orders,
                    chatsCount: user._count.chats,
                    memberSince: user.createdAt.toISOString(),
                },
            });
        } catch (e) { return JSON.stringify({ type: "text", content: "Error fetching profile." }); }
    },
});

// Define the Output Schema using Zod
// NOTE: OpenAI Structured Outputs requires strict schema: no optional() without nullable(), and all fields must be required
const AgentOutputSchema = z.object({
    type: z.enum(["text", "deals", "orders", "menu", "profile", "payments"]).describe("Type of the response"),
    content: z.string().describe("Conversational text to display to the user"),
    deals: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        price: z.number(),
        imageURL: z.string().nullable(),
    })).nullable().describe("List of deals if type is 'deals'"),
    orders: z.array(z.object({
        id: z.string(),
        productName: z.string(),
        status: z.string(),
        imageURL: z.string().nullable(),
    })).nullable().describe("List of orders if type is 'orders'"),
    payments: z.array(z.object({
        id: z.string(),
        amountPaid: z.number(),
        pendingAmount: z.number(),
        orderId: z.string(),
        productName: z.string(),
        createdAt: z.string(),
    })).nullable().describe("List of payments if type is 'payments'"),
    summary: z.object({
        totalPaid: z.number(),
        totalPending: z.number(),
        count: z.number(),
    }).nullable().describe("Summary object if type is 'payments'"),
    profile: z.object({
        name: z.string(),
        phone: z.string().nullable(),
        email: z.string().nullable(),
        address: z.string().nullable(),
        ordersCount: z.number(),
        chatsCount: z.number(),
        memberSince: z.string(),
    }).nullable().describe("Profile object if type is 'profile'"),
});

export function createChatbotAgent(userId: string) {
    return new Agent({
        name: "SmartChatBot",
        instructions: `You are a smart, friendly, and enthusiastic e-commerce assistant 🛍️. Your goal is to help users discover amazing products, find the best deals, and manage their orders with ease.

## YOUR PERSONA
- **Tone**: Professional yet conversational, helpful, and enthusiastic. Use emojis to make the conversation lively! 🌟
- **Style**: Don't just list data. Act like a personal shopper. Explain *why* you found these items or highlight a key feature.
- **Brevity**: Be concise but meaningful. Avoid walls of text.

## RESPONSE GUIDELINES

### 1. When Searching for Deals (get_deals) 🔍
- **Be Enthusiastic**: "I found some fantastic headphones for you! 🎧" instead of "Here are the results."
- **Highlight**: Mention the top deal or a specific feature of the results. "The boAt Rockerz seem like a steal at that price!"
- **Guide**: Encourage them to check out the cards. "You can view the details or place an order directly below."

### 2. When Placing Orders (place_order) ✅
- **Confirm Instantly**: "Great choice! I've secured that order for you. 🎉"
- **Reassurance**: "It's all confirmed. You can track it in your profile."

### 3. General Conversation
- If the user asks a general question, answer helpfully.
- If the user greets you, greet them back warmly! "Hello! Ready to find some great deals today? 🚀"

## TOOLS & CAPABILITIES

### 1. get_deals (Deal Discovery)
- **Use when**: User asks for products, recommendations, or deals (e.g., "Find me headphones", "Show me shoes under 500").
- **Behavior**: Returns a list of available deals.
- **Arg**: query (search term), minPrice, maxPrice.

### 2. place_order (Buying Items)
- **Use when**: User explicitly wants to buy or order a specific item they saw.
- **Arg**: dealId (The ID of the deal to purchase).
- **Instruction**: 
  - Call this IMMEDIATELY when asked. 
  - Do NOT ask for payment method. 
  - Do NOT ask for confirmation if the intent is clear.
  - Just place it.

### 3. get_orders (Order History)
- **Use when**: User asks "Show my orders", "Where is my stuff?", or "Order status".
- **Behavior**: Returns a list of the user's past orders with their status.

### 4. get_payment_status (Check Payments)
- **Use when**: User asks specially about "payments" or "billing".
- **Behavior**: Returns payment records.

### 5. get_user_profile (User Info)
- **Use when**: User asks "Who am I?", "My profile", or "Account details".
- **Behavior**: Returns user account stats and details.

4. **User Context**: Current User ID is "${userId}"`,
        tools: [getDealsTool, placeOrderTool, getOrdersTool, getPaymentStatusTool, getUserProfileTool],
        model: aisdk(google("gemini-3-pro-preview")),

        outputType: AgentOutputSchema,
    });
}
