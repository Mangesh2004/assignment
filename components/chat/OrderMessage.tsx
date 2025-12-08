"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    productName: string;
    status: string;
    imageURL: string | null;
    paymentUrl?: string | null;
}

interface OrderMessageProps {
    orders: Order[];
    content?: string;
}

export function OrderMessage({ orders, content }: OrderMessageProps) {
    if (!orders || orders.length === 0) return null;

    return (
        <div className="w-full">
            {content && (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 px-1">{content}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Image Section */}
                        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                            <img
                                src={order.imageURL || "/placeholder.png"}
                                alt={order.productName}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-sm uppercase tracking-wider">
                                {order.status}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-3 flex flex-col flex-1">
                            <h3
                                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.5em] mb-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                title={order.productName}
                            >
                                {order.productName}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1 mb-2 font-mono">
                                ID: {order.id.slice(0, 8)}...
                            </p>

                            <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                {order.paymentUrl ? (
                                    <a
                                        href={order.paymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1"
                                    >
                                        Pay Now
                                    </a>
                                ) : (
                                    <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm flex items-center justify-center gap-1">
                                        Track Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
