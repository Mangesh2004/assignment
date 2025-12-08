"use client";

import React, { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";

interface ChatMessagesProps {
    messages: any[];
    isLoading?: boolean;
    onOptionClick?: (opt: string) => void;
}

export function ChatMessages({ messages, isLoading, onOptionClick }: ChatMessagesProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 w-full overflow-y-auto p-4 md:p-6 scroll-smooth">
            <div className="max-w-3xl mx-auto min-h-full flex flex-col">
                {/* Spacer for top padding preference? Or just naturally flow */}

                {messages.length === 0 && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl mb-4" />
                        <p className="text-zinc-500 font-medium">Start a conversation</p>
                    </div>
                ) : (
                    messages.map((m) => (
                        <MessageBubble key={m.id} message={m} onOptionClick={onOptionClick} />
                    ))
                )}

                {isLoading && (
                    <div className="flex gap-4 mb-6">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-zinc-400">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>
        </div>
    );
}
