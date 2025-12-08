"use client";

import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble, Message } from "./MessageBubble";

interface ChatMessagesProps {
    messages: Message[];
    isLoading?: boolean;
    onOptionClick?: (option: string) => void;
}

export function ChatMessages({ messages, isLoading, onOptionClick }: ChatMessagesProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl">
                            <svg
                                className="h-10 w-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome to ChatBot!
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            Your AI-powered assistant for deals, orders, and payments. Start a conversation or use the quick actions menu.
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            onOptionClick={onOptionClick}
                        />
                    ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <div className="h-4 w-4 bg-white rounded-full opacity-70" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    );
}
