"use client";

import React, { useState, useEffect } from "react";
import { useAuth, AuthModal } from "@/components/auth";
import { ChatSidebar, ChatInput, ChatMessages } from "@/components/chat";
import { Menu } from "lucide-react";

export default function ChatPage() {
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [chats, setChats] = useState<any[]>([]);

    // State Layout Separation
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetch("/api/chat")
                .then(res => res.json())
                .then(data => {
                    if (data.chats) setChats(data.chats.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })));
                })
                .catch(err => console.error(err));
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && user && messages.length === 0) {
            setMessages([{
                id: "intro",
                role: "bot",
                content: "Hello! I can help you find deals, check orders, or manage your profile.",
                type: "menu",
                metadata: { options: ["Deals", "Orders", "Profile"] },
                createdAt: new Date()
            }]);
        }
    }, [isAuthenticated, user, messages.length]);

    const loadChat = async (id: string) => {
        try {
            const res = await fetch(`/api/chat?chatId=${id}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })));
                setActiveChatId(id);
            }
        } catch (e) { console.error(e); }
    };

    const handleSend = async (text: string) => {
        const tempId = Date.now().toString();
        const botTempId = (Date.now() + 1).toString();
        const userMsg = { id: tempId, role: "user", content: text, type: "text", createdAt: new Date() };

        // Add user message and placeholder bot message
        setMessages(p => [...p, userMsg, { id: botTempId, role: "bot", content: "", type: "text", createdAt: new Date() }]);
        setIsSending(true);

        try {
            const res = await fetch("/api/chat/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, chatId: activeChatId })
            });

            if (!res.ok) {
                const errorData = await res.json();
                setMessages(p => p.map(m => m.id === botTempId ? { ...m, content: "Error: " + (errorData.error || "Failed") } : m));
                setIsSending(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";
            let thinkingSteps: any[] = [];

            // Mark as thinking initially
            setMessages(p => p.map(m =>
                m.id === botTempId ? { ...m, isThinking: true, thinkingSteps: [] } : m
            ));

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.slice(6));

                                if (data.type === "text") {
                                    // Accumulate streaming text
                                    accumulatedText += data.content;

                                    // Regex patterns for different response types
                                    const dealRegex = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"title"\s*:\s*"([^"]*)"\s*,\s*"description"\s*:\s*"([^"]*)"\s*,\s*"price"\s*:\s*(\d+(?:\.\d+)?)\s*,\s*"imageURL"\s*:\s*"([^"]*)"\s*\}/g;
                                    const orderRegex = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"productName"\s*:\s*"([^"]*)"\s*,\s*"status"\s*:\s*"([^"]*)"\s*,\s*"imageURL"\s*:\s*"([^"]*)"\s*,\s*"paymentUrl"\s*:\s*"([^"]*)"\s*\}/g;

                                    setMessages(p => p.map(m => {
                                        if (m.id !== botTempId) return m;

                                        const currentMetadata = m.metadata || {};

                                        // Check for deals
                                        if (accumulatedText.includes('"type": "deals"') || accumulatedText.includes('"type":"deals"')) {
                                            const deals: any[] = [];
                                            let match;
                                            while ((match = dealRegex.exec(accumulatedText)) !== null) {
                                                deals.push({
                                                    id: match[1],
                                                    title: match[2],
                                                    description: match[3],
                                                    price: parseFloat(match[4]),
                                                    imageURL: match[5]
                                                });
                                            }
                                            if (deals.length > 0 && deals.length > (currentMetadata.deals?.length || 0)) {
                                                return { ...m, type: "deals", metadata: { ...currentMetadata, deals }, content: "Here are some deals:", isThinking: false };
                                            }
                                        }

                                        // Check for orders
                                        if (accumulatedText.includes('"type": "orders"') || accumulatedText.includes('"type":"orders"')) {
                                            const orders: any[] = [];
                                            let match;
                                            while ((match = orderRegex.exec(accumulatedText)) !== null) {
                                                orders.push({
                                                    id: match[1],
                                                    productName: match[2],
                                                    status: match[3],
                                                    imageURL: match[4],
                                                    paymentUrl: match[5]
                                                });
                                            }
                                            if (orders.length > 0 && orders.length > (currentMetadata.orders?.length || 0)) {
                                                return { ...m, type: "orders", metadata: { ...currentMetadata, orders }, content: "Here are your orders:", isThinking: false };
                                            }
                                        }

                                        // For other responses, just show the text
                                        return { ...m, content: accumulatedText };
                                    }));
                                } else if (data.type === "item") {
                                    // Progressive item streaming - add items one by one
                                    // Also stop thinking UI once items start arriving
                                    setMessages(p => p.map(m => {
                                        if (m.id !== botTempId) return m;

                                        const currentMetadata = m.metadata || {};
                                        let newType = m.type;

                                        if (data.itemType === "deal") {
                                            const deals = [...(currentMetadata.deals || []), data.item];
                                            newType = "deals";
                                            return { ...m, type: newType, metadata: { ...currentMetadata, deals }, content: "Here are some deals:", isThinking: false };
                                        } else if (data.itemType === "order") {
                                            const orders = [...(currentMetadata.orders || []), data.item];
                                            newType = "orders";
                                            return { ...m, type: newType, metadata: { ...currentMetadata, orders }, content: "Here are your orders:", isThinking: false };
                                        } else if (data.itemType === "payment") {
                                            const payments = [...(currentMetadata.payments || []), data.item];
                                            newType = "payments";
                                            return { ...m, type: newType, metadata: { ...currentMetadata, payments }, content: "Here is your payment info:", isThinking: false };
                                        } else if (data.itemType === "paymentSummary") {
                                            return { ...m, metadata: { ...currentMetadata, summary: data.item }, isThinking: false };
                                        } else if (data.itemType === "profile") {
                                            newType = "profile";
                                            return { ...m, type: newType, metadata: { ...currentMetadata, profile: data.item }, content: "Here is your profile:", isThinking: false };
                                        }
                                        return m;
                                    }));
                                } else if (data.type === "thinking") {
                                    // Accumulate thinking steps
                                    thinkingSteps = [...thinkingSteps, data];
                                    setMessages(p => p.map(m =>
                                        m.id === botTempId ? { ...m, thinkingSteps: thinkingSteps } : m
                                    ));
                                } else if (data.type === "done") {
                                    // Replace with final structured message, preserve thinking steps
                                    const botMsg = {
                                        ...data.message,
                                        createdAt: new Date(data.message.createdAt),
                                        thinkingSteps: thinkingSteps,
                                        isThinking: false
                                    };
                                    setMessages(p => p.map(m => m.id === botTempId ? botMsg : m));

                                    // Update chat list if new chat was created
                                    if (data.chatId && data.chatId !== activeChatId) {
                                        setActiveChatId(data.chatId);
                                        fetch("/api/chat").then(r => r.json()).then(d => {
                                            if (d.chats) setChats(d.chats.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })));
                                        });
                                    }
                                } else if (data.type === "error") {
                                    setMessages(p => p.map(m =>
                                        m.id === botTempId ? { ...m, content: "Error: " + data.error, isThinking: false } : m
                                    ));
                                }
                            } catch (parseError) {
                                // Ignore JSON parse errors for incomplete chunks
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
            setMessages(p => p.map(m =>
                m.id === botTempId ? { ...m, content: "Connection error." } : m
            ));
        } finally {
            setIsSending(false);
        }
    };

    if (isAuthLoading) return <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100" /></div>;
    if (!isAuthenticated) return <AuthModal onAuthSuccess={() => { }} />;

    const handleDeleteChat = async (id: string) => {
        try {
            const res = await fetch(`/api/chat?chatId=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setChats(chats.filter(c => c.id !== id));
                if (activeChatId === id) {
                    setActiveChatId(null);
                    setMessages([{ id: "new", role: "bot", content: "Chat deleted. How can I help you?", type: "text", createdAt: new Date() }]);
                }
            }
        } catch (e) {
            console.error("Failed to delete chat", e);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <ChatSidebar
                isOpen={desktopSidebarOpen}
                mobileOpen={mobileMenuOpen}
                setMobileOpen={setMobileMenuOpen}
                chats={chats}
                activeChatId={activeChatId}
                onNewChat={() => {
                    setActiveChatId(null);
                    setMessages([{ id: "new", role: "bot", content: "How can I help you?", type: "text", createdAt: new Date() }]);
                }}
                onSelectChat={loadChat}
                onDeleteChat={handleDeleteChat}
                user={user || undefined}
            />

            <main className="flex-1 flex flex-col h-full relative min-w-0 bg-white dark:bg-zinc-950 transition-colors duration-300">
                <div className="lg:hidden p-4 flex items-center border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 mx-auto pr-8">SmartBot</span>
                </div>

                <ChatMessages
                    messages={messages}
                    isLoading={isSending}
                    onOptionClick={handleSend}
                />

                <ChatInput
                    onSend={handleSend}
                    isLoading={isSending}
                />
            </main>
        </div>
    );
}
