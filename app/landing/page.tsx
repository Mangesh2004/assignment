"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
    MessageSquare,
    Sparkles,
    Zap,
    ShoppingBag,
    CreditCard,
    User,
    Moon,
    Sun,
    ArrowRight,
    Bot,
    Layers,
    Eye
} from "lucide-react";

export default function LandingPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const features = [
        {
            icon: <Bot className="w-6 h-6" />,
            title: "AI-Powered Chat",
            description: "Smart e-commerce assistant powered by Google Gemini that understands your needs.",
            gradient: "from-violet-500 to-purple-600",
            size: "col-span-2 md:col-span-1",
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "Real-time Thinking",
            description: "Watch the AI think! See tool calls and reasoning in a collapsible view.",
            gradient: "from-amber-500 to-orange-600",
            size: "col-span-2 md:col-span-1",
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Progressive Streaming",
            description: "Cards appear one-by-one as data streams in. No waiting for full responses.",
            gradient: "from-emerald-500 to-teal-600",
            size: "col-span-2",
        },
        {
            icon: <ShoppingBag className="w-6 h-6" />,
            title: "Deal Discovery",
            description: "Find the best deals with semantic search powered by vector embeddings.",
            gradient: "from-blue-500 to-cyan-600",
            size: "col-span-2 md:col-span-1",
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "Order Management",
            description: "Track orders, view payment status, and manage your purchases seamlessly.",
            gradient: "from-rose-500 to-pink-600",
            size: "col-span-2 md:col-span-1",
        },
        {
            icon: <Layers className="w-6 h-6" />,
            title: "Structured Output",
            description: "Guaranteed JSON responses with validation and retry logic for reliability.",
            gradient: "from-indigo-500 to-blue-600",
            size: "col-span-2 md:col-span-1",
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: "Markdown Rendering",
            description: "Rich text responses with full markdown support in beautiful card layouts.",
            gradient: "from-fuchsia-500 to-purple-600",
            size: "col-span-2 md:col-span-1",
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-zinc-900 dark:text-white">SmartBot</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    {theme === "dark" ? (
                                        <Sun className="w-5 h-5 text-zinc-400" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-zinc-600" />
                                    )}
                                </button>
                            )}
                            <Link
                                href="/chat"
                                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                            >
                                Open Chat
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Powered by Gemini AI
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
                        Your Smart{" "}
                        <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            E-Commerce
                        </span>{" "}
                        Assistant
                    </h1>
                    <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
                        Find deals, track orders, manage payments, and get instant help with our AI-powered chatbot.
                        Experience real-time streaming and progressive card rendering.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/chat"
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                        >
                            Start Chatting
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            No signup required • Free to use
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Built with Modern Tech
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
                            Cutting-edge features for a seamless shopping experience
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className={`${feature.size} group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                            Technology Stack
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-8 text-zinc-500 dark:text-zinc-400">
                        {["Next.js 16", "React 19", "Gemini AI", "Prisma", "PostgreSQL", "Tailwind CSS", "OpenAI Agents SDK"].map((tech, i) => (
                            <div key={i} className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-12 text-white">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Ready to Experience Smart Shopping?
                    </h2>
                    <p className="text-violet-200 mb-8 text-lg">
                        Start a conversation and discover how AI can transform your e-commerce experience.
                    </p>
                    <Link
                        href="/chat"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 rounded-xl font-semibold text-lg hover:bg-violet-50 transition-colors"
                    >
                        Launch SmartBot
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="max-w-6xl mx-auto text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Built with ❤️ for the Full-Stack Chatbot Assignment
                </div>
            </footer>
        </div>
    );
}
