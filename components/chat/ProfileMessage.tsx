"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Profile {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    ordersCount: number;
    chatsCount: number;
    memberSince: string;
}

interface ProfileMessageProps {
    profile: Profile;
    content?: string;
}

export function ProfileMessage({ profile, content }: ProfileMessageProps) {
    if (!profile) return null;

    return (
        <div className="w-full max-w-sm">
            {content && (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 px-1">{content}</p>
            )}

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Header with Avatar */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 flex flex-col items-center border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold mb-3 border-4 border-white dark:border-zinc-900 shadow-sm">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</h3>
                    <p className="text-xs text-zinc-500">Member since {new Date(profile.memberSince).getFullYear()}</p>
                </div>

                {/* Details Grid */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                        <span className="text-xs text-zinc-500 uppercase tracking-wide">Email</span>
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                        <span className="text-xs text-zinc-500 uppercase tracking-wide">Phone</span>
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profile.phone || "N/A"}</span>
                    </div>
                    <div className="pt-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-wide block mb-1">Address</span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-lg">
                            {profile.address || "No address set"}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-2">
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{profile.ordersCount}</p>
                            <p className="text-[10px] text-blue-500 dark:text-blue-400 uppercase">Orders</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{profile.chatsCount}</p>
                            <p className="text-[10px] text-purple-500 dark:text-purple-400 uppercase">Chats</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
