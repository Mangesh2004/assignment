"use client";

import React from "react";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DealCard } from "./DealCard";
import { OrderCard } from "./OrderCard";
import { PaymentCard } from "./PaymentCard";
import { ProfileCard } from "./ProfileCard";

export interface Message {
    id: string;
    role: "user" | "bot";
    content: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
    createdAt: Date;
}

interface MessageBubbleProps {
    message: Message;
    onOptionClick?: (option: string) => void;
}

export function MessageBubble({ message, onOptionClick }: MessageBubbleProps) {
    const isBot = message.role === "bot";
    const metadata = message.metadata;

    const renderTextBubble = (content: string) => (
        <div
            className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                isBot
                    ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-md border border-gray-100 dark:border-gray-700"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-md"
            )}
        >
            {content}
        </div>
    );

    return (
        <div
            className={cn(
                "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                isBot ? "flex-row" : "flex-row-reverse"
            )}
        >
            {/* Avatar */}
            <Avatar className={cn("h-9 w-9 flex-shrink-0", !isBot && "ring-blue-200 dark:ring-blue-800")}>
                <AvatarFallback
                    className={cn(
                        isBot
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    )}
                >
                    {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div className={cn("flex flex-col gap-2 max-w-[80%]", !isBot && "items-end")}>
                {/* Text Message (default) */}
                {message.type === "text" && renderTextBubble(message.content)}

                {/* Deals Cards */}
                {message.type === "deals" && metadata?.deals && (
                    <div className="flex flex-col gap-2">
                        {renderTextBubble(message.content)}
                        <div className="flex flex-wrap gap-3">
                            {metadata.deals.map((deal: { id: string; title: string; description: string; price: number; imageURL: string }) => (
                                <DealCard
                                    key={deal.id}
                                    title={deal.title}
                                    description={deal.description}
                                    price={deal.price}
                                    imageURL={deal.imageURL}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders Cards */}
                {message.type === "orders" && metadata?.orders && (
                    <div className="flex flex-col gap-2">
                        {renderTextBubble(message.content)}
                        <div className="flex flex-wrap gap-3">
                            {metadata.orders.map((order: { id: string; productName: string; imageURL: string; status: string; createdAt: string; payment?: { amountPaid: number; pendingAmount: number } }) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment Card */}
                {message.type === "payments" && metadata?.summary && metadata?.payments && (
                    <div className="flex flex-col gap-2">
                        {renderTextBubble(message.content)}
                        <PaymentCard
                            summary={metadata.summary}
                            payments={metadata.payments}
                        />
                    </div>
                )}

                {/* Profile Card */}
                {message.type === "profile" && metadata?.profile && (
                    <div className="flex flex-col gap-2">
                        {renderTextBubble(message.content)}
                        <ProfileCard profile={metadata.profile} />
                    </div>
                )}

                {/* Menu Options */}
                {message.type === "menu" && metadata?.options && (
                    <div className="flex flex-col gap-2">
                        {renderTextBubble(message.content)}
                        <div className="flex flex-wrap gap-2">
                            {metadata.options.map((option: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => onOptionClick?.(option)}
                                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>
        </div>
    );
}
