"use client";

import React from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealMessage } from "./DealMessage";
import { OrderMessage } from "./OrderMessage";
import { PaymentMessage } from "./PaymentMessage";
import { ProfileMessage } from "./ProfileMessage";
import { TextMessage } from "./TextMessage";
import { ThinkingBubble } from "./ThinkingBubble";

export function MessageBubble({ message, onOptionClick }: { message: any, onOptionClick?: (opt: string) => void }) {
    const isBot = message.role === "bot";
    const thinkingSteps = message.thinkingSteps || [];
    const isThinking = message.isThinking || false;

    return (
        <div className={cn("flex w-full mb-6", isBot ? "justify-start" : "justify-end")}>
            <div className={cn("flex max-w-[90%] md:max-w-[85%]", isBot ? "flex-row gap-4" : "flex-row-reverse gap-3")}>

                {/* Avatar */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    isBot ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm" : "bg-zinc-200 dark:bg-zinc-700"
                )}>
                    {isBot ? <Bot className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /> : <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
                </div>

                {/* Content */}
                <div className={cn("flex flex-col min-w-0 w-full", isBot ? "items-start" : "items-end")}>

                    {/* Name Label */}
                    {isBot && <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">SmartBot</span>}

                    {/* Thinking Bubble - shows tool calls */}
                    {isBot && (thinkingSteps.length > 0 || isThinking) && (
                        <ThinkingBubble steps={thinkingSteps} isThinking={isThinking} />
                    )}

                    {/* Text Bubble - Bot gets a card with markdown, User gets a simple bubble */}
                    {message.type === "text" && (
                        isBot ? (
                            <TextMessage content={message.content} />
                        ) : (
                            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                            </div>
                        )
                    )}

                    {/* Deals Cards */}
                    {message.type === "deals" && message.metadata?.deals && (
                        <DealMessage deals={message.metadata.deals} content={message.content} onOptionClick={onOptionClick} />
                    )}

                    {/* Orders Cards */}
                    {message.type === "orders" && message.metadata?.orders && (
                        <OrderMessage orders={message.metadata.orders} content={message.content} />
                    )}

                    {/* Payment Cards */}
                    {message.type === "payments" && message.metadata?.payments && message.metadata?.summary && (
                        <PaymentMessage
                            payments={message.metadata.payments}
                            summary={message.metadata.summary}
                            content={message.content}
                        />
                    )}

                    {/* Profile Card */}
                    {message.type === "profile" && message.metadata?.profile && (
                        <ProfileMessage profile={message.metadata.profile} content={message.content} />
                    )}


                    {/* Menu */}
                    {message.type === "menu" && message.metadata?.options && (
                        <div className="mt-2">
                            {message.content && <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">{message.content}</p>}
                            <div className="flex flex-wrap gap-2">
                                {message.metadata.options.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => onOptionClick?.(opt)}
                                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
