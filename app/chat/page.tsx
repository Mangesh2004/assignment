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
        const userMsg = { id: tempId, role: "user", content: text, type: "text", createdAt: new Date() };
        setMessages(p => [...p, userMsg]);
        setIsSending(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, chatId: activeChatId })
            });
            const data = await res.json();

            if (data.success && data.message) {
                if (data.chatId && data.chatId !== activeChatId) {
                    setActiveChatId(data.chatId);
                    fetch("/api/chat").then(r => r.json()).then(d => {
                        if (d.chats) setChats(d.chats.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })));
                    });
                }
                const botMsg = { ...data.message, createdAt: new Date(data.message.createdAt) };
                setMessages(p => [...p, botMsg]);
            } else {
                setMessages(p => [...p, { id: Date.now().toString(), role: "bot", content: "Error: " + (data.error || "Failed"), type: "text", createdAt: new Date() }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(p => [...p, { id: Date.now().toString(), role: "bot", content: "Connection error.", type: "text", createdAt: new Date() }]);
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
