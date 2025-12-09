"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, ArrowRight, Bot } from "lucide-react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      {/* Minimal Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center">
              <Bot className="w-4 h-4 text-white dark:text-zinc-900" />
            </div>
            <span className="font-medium text-zinc-900 dark:text-white tracking-tight">SmartBot</span>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-zinc-400" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-500" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Hero - Clean and Direct */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6 tracking-wide uppercase">
            E-Commerce Assistant
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-zinc-900 dark:text-white leading-[1.1] tracking-tight mb-8">
            Shop smarter with<br />
            <span className="text-zinc-400 dark:text-zinc-500">conversational AI</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-12 leading-relaxed">
            Find deals, track orders, and manage payments through natural conversation.
            Built with Gemini AI and real-time streaming.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors group"
          >
            Start a conversation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Features - Simple Grid */}
      <section className="py-20 px-6 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default bg-white dark:bg-zinc-950 hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-transparent hover:shadow-2xl hover:shadow-zinc-900/20 dark:hover:shadow-black/40 before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-zinc-400 before:to-zinc-900 dark:before:from-zinc-700 dark:before:to-black before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10">
              <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mb-3 group-hover:text-zinc-400 transition-colors">01</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 group-hover:text-white transition-colors">Deal Discovery</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                Semantic search powered by vector embeddings. Find products by describing what you need.
              </p>
            </div>
            <div className="group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default bg-white dark:bg-zinc-950 hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-transparent hover:shadow-2xl hover:shadow-zinc-900/20 dark:hover:shadow-black/40 before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-zinc-400 before:to-zinc-900 dark:before:from-zinc-700 dark:before:to-black before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10">
              <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mb-3 group-hover:text-zinc-400 transition-colors">02</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 group-hover:text-white transition-colors">Live Streaming</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                Watch responses appear in real-time. Cards render progressively as data arrives.
              </p>
            </div>
            <div className="group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default bg-white dark:bg-zinc-950 hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-transparent hover:shadow-2xl hover:shadow-zinc-900/20 dark:hover:shadow-black/40 before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-zinc-400 before:to-zinc-900 dark:before:from-zinc-700 dark:before:to-black before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10">
              <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mb-3 group-hover:text-zinc-400 transition-colors">03</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 group-hover:text-white transition-colors">Visible Thinking</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                Expand the thinking bubble to see tool calls and reasoning as the AI works.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Capabilities */}
      <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mb-8 tracking-wide uppercase">
            Capabilities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Search deals",
              "Place orders",
              "Track shipments",
              "Payment status",
              "View profile",
              "Order history",
              "Price filtering",
              "Chat history"
            ].map((item, i) => (
              <div
                key={i}
                className="group px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 cursor-default transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/10 dark:hover:shadow-black/30 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="py-20 px-6 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 className="text-sm font-medium text-zinc-400 dark:text-zinc-500 mb-2 tracking-wide uppercase">
              Built with
            </h2>
            <p className="text-zinc-900 dark:text-white">
              Next.js • React • Gemini AI • PostgreSQL • Prisma
            </p>
          </div>
          <Link
            href="/chat"
            className="text-zinc-900 dark:text-white font-medium hover:underline underline-offset-4 flex items-center gap-2"
          >
            Open the chatbot
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>


    </div>
  );
}
