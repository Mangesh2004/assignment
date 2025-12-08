"use client";

import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSend(value.trim());
                setValue("");
            }
        }
    };

    const handleSend = () => {
        if (value.trim() && !isLoading) {
            onSend(value.trim());
            setValue("");
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4 md:pb-6 pt-2">
            <div className="relative flex items-end w-full p-3 bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus-within:border-zinc-300 dark:focus-within:border-zinc-700 focus-within:bg-white dark:focus-within:bg-zinc-800 rounded-2xl transition-all duration-200 ease-out shadow-sm">

                {/* Attachment Button (Visual Only for now) */}
                <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mr-1">
                    <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message ChatBot..."
                    className="flex-1 max-h-[200px] py-2 px-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none leading-relaxed"
                    rows={1}
                    disabled={isLoading}
                />

                <button
                    onClick={handleSend}
                    disabled={!value.trim() || isLoading}
                    className={cn(
                        "p-2 rounded-xl transition-all duration-200",
                        value.trim() && !isLoading
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:opacity-90 active:scale-95"
                            : "bg-transparent text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                    )}
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            </div>
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                AI can make mistakes. Check important info.
            </p>
        </div>
    );
}
