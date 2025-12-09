"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface TextMessageProps {
    content: string;
}

export function TextMessage({ content }: TextMessageProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm max-w-xl">
            <div className="prose prose-sm dark:prose-invert prose-zinc max-w-none">
                <ReactMarkdown
                    components={{
                        // Custom styling for markdown elements
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-zinc-700 dark:text-zinc-300">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-zinc-700 dark:text-zinc-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-zinc-700 dark:text-zinc-300">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-800 dark:text-zinc-200">
                                {children}
                            </code>
                        ),
                        pre: ({ children }) => (
                            <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg overflow-x-auto mb-2">
                                {children}
                            </pre>
                        ),
                        a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                                {children}
                            </a>
                        ),
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-zinc-900 dark:text-zinc-100">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-zinc-900 dark:text-zinc-100">{children}</h3>,
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-3 italic text-zinc-600 dark:text-zinc-400 mb-2">
                                {children}
                            </blockquote>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
