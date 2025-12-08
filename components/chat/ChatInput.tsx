"use client";

import React, { useState, FormEvent, KeyboardEvent } from "react";
import { Send, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function ChatInput({ onSendMessage, isLoading, placeholder = "Type your message..." }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim());
            setMessage("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        rows={1}
                        className={cn(
                            "w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 px-4 py-3 pr-12 text-sm transition-all duration-200",
                            "focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "min-h-[48px] max-h-[120px]"
                        )}
                        style={{
                            height: "auto",
                            overflowY: message.split("\n").length > 3 ? "auto" : "hidden",
                        }}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                        <button
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Voice input"
                        >
                            <Mic className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Attach file"
                        >
                            <Paperclip className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    size="icon"
                    className="h-12 w-12 rounded-xl shrink-0"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </form>
    );
}
