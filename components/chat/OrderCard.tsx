"use client";

import React from "react";
import { Package, CreditCard, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface Order {
    id: string;
    productName: string;
    imageURL: string;
    status: string;
    createdAt: string;
    payment?: {
        amountPaid: number;
        pendingAmount: number;
    } | null;
}

interface OrderCardProps {
    order: Order;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    pending: {
        icon: <Clock className="h-4 w-4" />,
        color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
        label: "Pending",
    },
    processing: {
        icon: <Package className="h-4 w-4" />,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
        label: "Processing",
    },
    shipped: {
        icon: <Truck className="h-4 w-4" />,
        color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
        label: "Shipped",
    },
    delivered: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "text-green-600 bg-green-100 dark:bg-green-900/30",
        label: "Delivered",
    },
    cancelled: {
        icon: <XCircle className="h-4 w-4" />,
        color: "text-red-600 bg-red-100 dark:bg-red-900/30",
        label: "Cancelled",
    },
};

export function OrderCard({ order }: OrderCardProps) {
    const status = statusConfig[order.status] || statusConfig.pending;

    return (
        <Card className="w-72 overflow-hidden">
            {/* Image */}
            <div className="h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <img
                    src={order.imageURL}
                    alt={order.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.png";
                    }}
                />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {order.productName}
                    </h3>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                    </span>
                </div>
                <p className="text-xs text-gray-400">
                    Order ID: {order.id.slice(0, 8)}...
                </p>
            </CardHeader>

            <CardContent className="pb-4">
                {order.payment && (
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                                {formatPrice(order.payment.amountPaid)}
                            </span>
                        </div>
                        {order.payment.pendingAmount > 0 && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                    {formatPrice(order.payment.pendingAmount)} pending
                                </span>
                            </div>
                        )}
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                    })}
                </p>
            </CardContent>
        </Card>
    );
}
