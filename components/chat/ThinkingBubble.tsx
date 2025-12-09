"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Search, Database, User, CreditCard, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingStep {
    action: string;
    tool?: string;
    args?: string;
    result?: string;
    agent?: string;
}

interface ThinkingBubbleProps {
    steps: ThinkingStep[];
    isThinking: boolean;
}

const toolIcons: Record<string, React.ReactNode> = {
    "get_deals": <Search className="w-3.5 h-3.5" />,
    "get_orders": <Package className="w-3.5 h-3.5" />,
    "get_payment_status": <CreditCard className="w-3.5 h-3.5" />,
    "get_user_profile": <User className="w-3.5 h-3.5" />,
    "place_order": <Package className="w-3.5 h-3.5" />,
};

const toolLabels: Record<string, string> = {
    "get_deals": "Searching deals",
    "get_orders": "Fetching orders",
    "get_payment_status": "Checking payments",
    "get_user_profile": "Loading profile",
    "place_order": "Placing order",
};

export function ThinkingBubble({ steps, isThinking }: ThinkingBubbleProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (steps.length === 0 && !isThinking) return null;

    const lastStep = steps[steps.length - 1];
    const currentAction = lastStep?.tool
        ? toolLabels[lastStep.tool] || `Using ${lastStep.tool}`
        : "Processing";

    return (
        <div className="mb-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                    "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
                    "border border-violet-200 dark:border-violet-800/50",
                    "hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-900/40 dark:hover:to-purple-900/40",
                    "text-violet-700 dark:text-violet-300"
                )}
            >
                {isThinking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                ) : (
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                )}
                <span>{isThinking ? currentAction : "Thought process"}</span>
                {steps.length > 0 && (
                    <span className="text-violet-500/70">({steps.length} steps)</span>
                )}
                {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 ml-1" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                )}
            </button>

            {isExpanded && steps.length > 0 && (
                <div className="mt-2 ml-2 pl-3 border-l-2 border-violet-200 dark:border-violet-800/50 space-y-2">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <div className="mt-0.5 p-1 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                {step.action === "tool_call" && step.tool ? (
                                    toolIcons[step.tool] || <Database className="w-3.5 h-3.5" />
                                ) : step.action === "tool_result" ? (
                                    <span className="text-green-500">✓</span>
                                ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                {step.action === "tool_call" && (
                                    <div>
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                            {step.tool && (toolLabels[step.tool] || step.tool)}
                                        </span>
                                        {step.args && (
                                            <div className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate max-w-[250px]">
                                                {step.args}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {step.action === "tool_result" && (
                                    <span className="text-green-600 dark:text-green-400">Done</span>
                                )}
                                {step.action === "agent_update" && (
                                    <span>{step.agent} is thinking...</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
