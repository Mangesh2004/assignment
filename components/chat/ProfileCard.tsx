"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Package, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Profile {
    name: string;
    phone: string;
    email: string;
    address: string;
    ordersCount: number;
    chatsCount: number;
    memberSince: string;
}

interface ProfileCardProps {
    profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
    return (
        <Card className="w-80 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white pb-6">
                <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-3 ring-4 ring-white/30">
                        <User className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl">{profile.name}</h3>
                    <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Member since {new Date(profile.memberSince).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="p-4 -mt-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-3">
                    {/* Contact Info */}
                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Phone</p>
                            <p className="font-medium text-gray-900 dark:text-white">{profile.phone}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                                {profile.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Address</p>
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                                {profile.address}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {profile.ordersCount}
                                </p>
                                <p className="text-xs text-gray-400">Orders</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {profile.chatsCount}
                                </p>
                                <p className="text-xs text-gray-400">Chats</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
