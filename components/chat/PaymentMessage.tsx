"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Payment {
    id: string;
    amountPaid: number;
    pendingAmount: number;
    productName: string;
    createdAt: string;
}

interface Summary {
    totalPaid: number;
    totalPending: number;
    count: number;
}

interface PaymentMessageProps {
    payments: Payment[];
    summary: Summary;
    content?: string;
}

export function PaymentMessage({ payments, summary, content }: PaymentMessageProps) {
    if (!payments || payments.length === 0) return null;

    return (
        <div className="w-full max-w-lg">
            {content && (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 px-1">{content}</p>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wide">Paid</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">₹{summary.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">₹{summary.totalPending.toLocaleString()}</p>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {payments.map((p) => (
                        <div key={p.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex justify-between items-center group">
                            <div>
                                <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {p.productName}
                                </h4>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                {p.pendingAmount > 0 ? (
                                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                                        Due: ₹{p.pendingAmount.toLocaleString()}
                                    </div>
                                ) : (
                                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        ₹{p.amountPaid.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
