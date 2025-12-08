"use client";

import React from "react";
import { Plus, MessageSquare, Settings, User as UserIcon, Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "next-themes";

interface ChatSidebarProps {
    isOpen?: boolean; // Desktop desktop visual state
    mobileOpen?: boolean; // Mobile sheet state
    setMobileOpen?: (open: boolean) => void;
    onNewChat: () => void;
    chats: { id: string; title: string; createdAt: Date }[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    className?: string;
    user?: { name?: string; email?: string };
}

export function ChatSidebar({
    isOpen = true,
    mobileOpen = false,
    setMobileOpen,
    onNewChat,
    chats,
    activeChatId,
    onSelectChat,
    className,
    user
}: ChatSidebarProps) {
    const { setTheme, theme } = useTheme();

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
            {/* Header / New Chat */}
            <div className="p-3 sticky top-0 bg-inherit z-10">
                <button
                    onClick={() => {
                        onNewChat();
                        setMobileOpen?.(false);
                    }}
                    className="group flex items-center justify-between w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">New Chat</span>
                    </div>
                    <MessageSquare className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
                {chats.length > 0 ? (
                    <div className="mb-4">
                        <p className="px-3 py-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Recent</p>
                        {chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => {
                                    onSelectChat(chat.id);
                                    setMobileOpen?.(false);
                                }}
                                className={cn(
                                    "flex items-center w-full gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                                    activeChatId === chat.id
                                        ? "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                                )}
                            >
                                <span className="truncate flex-1">{chat.title}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-8 text-center">
                        <p className="text-sm text-zinc-500">No chats yet.</p>
                    </div>
                )}
            </div>

            {/* Footer / User Profile & Theme */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                {/* User */}
                <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-200 uppercase font-bold text-xs">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user?.name || "Guest User"}</p>
                    </div>
                </button>

                {/* Theme Toggle Strip */}
                <div className="flex items-center justify-between px-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                    <span className="text-xs text-zinc-500 font-medium">Theme</span>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                        <button onClick={() => setTheme("light")} className={cn("p-1.5 rounded-md transition-all", theme === "light" ? "bg-white dark:bg-zinc-700 shadow-sm text-amber-500" : "text-zinc-400 hover:text-zinc-600")}>
                            <Sun className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setTheme("system")} className={cn("p-1.5 rounded-md transition-all", theme === "system" ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-500" : "text-zinc-400 hover:text-zinc-600")}>
                            <Monitor className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setTheme("dark")} className={cn("p-1.5 rounded-md transition-all", theme === "dark" ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-500" : "text-zinc-400 hover:text-zinc-600")}>
                            <Moon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Drawer - Explicit State */}
            <div className="lg:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="p-0 w-[280px]">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:block h-screen flex-shrink-0 transition-all duration-300 ease-in-out border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950",
                    isOpen ? "w-[260px]" : "w-0 overflow-hidden border-none"
                )}
            >
                <div className="w-[260px] h-full">
                    <SidebarContent />
                </div>
            </aside>
        </>
    );
}
