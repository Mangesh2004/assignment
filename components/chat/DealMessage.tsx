"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Deal {
    id: string;
    title: string;
    description: string;
    price: number;
    imageURL: string;
}

interface DealMessageProps {
    deals: Deal[];
    content?: string;
    onOptionClick?: (msg: string) => void;
}

export function DealMessage({ deals, content, onOptionClick }: DealMessageProps) {
    if (!deals || deals.length === 0) return null;

    return (
        <div className="w-full">
            {content && (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 px-1">{content}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.map((deal) => (
                    <div
                        key={deal.id}
                        className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Image Section */}
                        <div className="h-40 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                            <img
                                src={deal.imageURL || "/placeholder.png"}
                                alt={deal.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                                ₹{deal.price?.toLocaleString()}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-3 flex flex-col flex-1">
                            <h3
                                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.5em] mb-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                title={deal.title}
                            >
                                {deal.title}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2 mb-3 leading-relaxed">
                                {deal.description}
                            </p>

                            {/* Action Footer */}
                            <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    onClick={() => onOptionClick?.(`Buy ${deal.title}`)}
                                    className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
