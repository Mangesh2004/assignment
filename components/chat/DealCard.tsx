"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface DealCardProps {
    title: string;
    description: string;
    price: number;
    imageURL: string;
    onBuy?: () => void;
}

export function DealCard({ title, description, price, imageURL, onBuy }: DealCardProps) {
    const formattedPrice = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(price);

    return (
        <Card className="w-72 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            {/* Image */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <img
                    src={imageURL}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.png";
                    }}
                />
                <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    HOT DEAL
                </div>
            </div>

            <CardHeader className="pb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
            </CardHeader>

            <CardContent className="pb-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formattedPrice}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                        }).format(price * 1.3)}
                    </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Save 30%
                </span>
            </CardContent>

            <CardFooter>
                <Button onClick={onBuy} className="w-full gap-2" size="sm">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
