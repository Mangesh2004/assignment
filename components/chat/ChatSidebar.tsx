"use client";

import React from "react";
import { Plus, MessageSquare, Package, CreditCard, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ChatHistoryItem {
    id: string;
    title: string;
    createdAt: Date;
}

interface ChatSidebarProps {
    chats: ChatHistoryItem[];
    activeChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onMenuAction: (action: string) => void;
}

const menuItems = [
    { id: "deals", label: "New Deals", icon: Tag },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "payment", label: "Payment Status", icon: CreditCard },
    { id: "profile", label: "My Profile", icon: User },
];

export function ChatSidebar({
    chats,
    activeChatId,
    onNewChat,
    onSelectChat,
    onMenuAction,
}: ChatSidebarProps) {
    return (
        <div className="flex h-full w-72 flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-900 dark:text-white">ChatBot</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Your AI Assistant</p>
                    </div>
                </div>
                <Button onClick={onNewChat} className="w-full gap-2" size="sm">
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">QUICK ACTIONS</p>
                <div className="grid grid-cols-2 gap-2">
                    {menuItems.map((item) => (
                        <Button
                            key={item.id}
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2 text-xs h-9"
                            onClick={() => onMenuAction(item.id)}
                        >
                            <item.icon className="h-3.5 w-3.5" />
                            {item.label}
                        </Button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Chat History */}
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 p-3 pb-1 px-5">RECENT CHATS</p>
                <ScrollArea className="h-full px-2 pb-2">
                    <div className="space-y-1">
                        {chats.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                                No chats yet
                            </p>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => onSelectChat(chat.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                                        activeChatId === chat.id
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate font-medium">{chat.title}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-5">
                                        {new Date(chat.createdAt).toLocaleDateString()}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
