"use client";

import React from "react";
import { CreditCard, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface PaymentSummary {
    totalPaid: number;
    totalPending: number;
    count: number;
}

interface Payment {
    id: string;
    orderId: string;
    productName: string;
    amountPaid: number;
    pendingAmount: number;
    createdAt: string;
}

interface PaymentCardProps {
    summary: PaymentSummary;
    payments: Payment[];
}

export function PaymentCard({ summary, payments }: PaymentCardProps) {
    return (
        <Card className="w-80 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Payment Summary</h3>
                        <p className="text-white/80 text-sm">{summary.count} transactions</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                            <p className="font-bold text-green-600 dark:text-green-400">
                                {formatPrice(summary.totalPaid)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                            <p className="font-bold text-orange-600 dark:text-orange-400">
                                {formatPrice(summary.totalPending)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                {payments.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            Recent Payments
                        </p>
                        {payments.slice(0, 3).map((payment) => (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {payment.productName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        {formatPrice(payment.amountPaid)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
