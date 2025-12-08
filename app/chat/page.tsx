"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useAuth, AuthModal } from "@/components/auth";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { type Message } from "@/components/chat/MessageBubble";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHistory {
    id: string;
    title: string;
    createdAt: Date;
}

export default function ChatPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [chats, setChats] = useState<ChatHistory[]>([]);

    // Load chat history when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadChats();
        }
    }, [isAuthenticated]);

    // Load welcome message when authenticated and no messages
    useEffect(() => {
        if (isAuthenticated && user && messages.length === 0) {
            setMessages([
                {
                    id: "welcome",
                    role: "bot",
                    content: `Hello ${user.name}! 👋 Welcome to Smart ChatBot. I can help you with deals, orders, payments, and more. What would you like to know?`,
                    type: "menu",
                    metadata: {
                        options: ["Show Deals", "My Orders", "Payment Status", "My Profile"],
                    },
                    createdAt: new Date(),
                },
            ]);
        }
    }, [isAuthenticated, user, messages.length]);

    const loadChats = async () => {
        try {
            const res = await fetch("/api/chat");
            const data = await res.json();
            if (data.chats) {
                setChats(data.chats.map((c: { id: string; title: string; createdAt: string }) => ({
                    ...c,
                    createdAt: new Date(c.createdAt),
                })));
            }
        } catch (error) {
            console.error("Failed to load chats:", error);
        }
    };

    const loadChatMessages = async (chatId: string) => {
        try {
            const res = await fetch(`/api/chat?chatId=${chatId}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages.map((m: { id: string; role: string; content: string; type: string; metadata: Record<string, unknown>; createdAt: string }) => ({
                    ...m,
                    createdAt: new Date(m.createdAt),
                })));
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    };

    const handleSendMessage = useCallback(async (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            type: "text",
            createdAt: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsSending(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content,
                    chatId: activeChatId,
                }),
            });

            const data = await res.json();

            if (data.success && data.message) {
                // Update active chat ID if new chat was created
                if (data.chatId && data.chatId !== activeChatId) {
                    setActiveChatId(data.chatId);
                    loadChats(); // Refresh chat list
                }

                const botMessage: Message = {
                    id: data.message.id,
                    role: "bot",
                    content: data.message.content,
                    type: data.message.type,
                    metadata: data.message.metadata,
                    createdAt: new Date(data.message.createdAt),
                };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                // Error response
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "bot",
                    content: data.error || "Sorry, something went wrong. Please try again.",
                    type: "text",
                    createdAt: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: "Sorry, I'm having trouble connecting. Please try again.",
                type: "text",
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
        }
    }, [activeChatId]);

    const handleNewChat = useCallback(() => {
        setActiveChatId(null);
        setMessages([
            {
                id: "welcome-new",
                role: "bot",
                content: "Hello! 👋 How can I help you today?",
                type: "menu",
                metadata: {
                    options: ["Show Deals", "My Orders", "Payment Status", "My Profile"],
                },
                createdAt: new Date(),
            },
        ]);
    }, []);

    const handleSelectChat = useCallback((chatId: string) => {
        setActiveChatId(chatId);
        loadChatMessages(chatId);
    }, []);

    const handleMenuAction = useCallback((action: string) => {
        const actionMessages: Record<string, string> = {
            deals: "Show me the latest deals",
            orders: "Show my orders",
            payment: "Check my payment status",
            profile: "Show my profile",
        };
        if (actionMessages[action]) {
            handleSendMessage(actionMessages[action]);
        }
    }, [handleSendMessage]);

    const handleOptionClick = useCallback((option: string) => {
        handleSendMessage(option);
    }, [handleSendMessage]);

    const handleLogout = async () => {
        await logout();
        setMessages([]);
        setChats([]);
        setActiveChatId(null);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - show login
    if (!isAuthenticated) {
        return <AuthModal onAuthSuccess={() => { }} />;
    }

    // Authenticated - show chat
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            {/* Sidebar */}
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onMenuAction={handleMenuAction}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6">
                    <div>
                        <h1 className="font-semibold text-gray-900 dark:text-white">
                            Chat with {user?.name}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            AI Assistant • Powered by OpenAI
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </header>

                {/* Messages */}
                <ChatMessages
                    messages={messages}
                    isLoading={isSending}
                    onOptionClick={handleOptionClick}
                />

                {/* Input */}
                <ChatInput onSendMessage={handleSendMessage} isLoading={isSending} />
            </div>
        </div>
    );
}
