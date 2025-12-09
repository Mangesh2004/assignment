"use client";

import React, { useState, useRef, useEffect } from "react";
import { KeyRound, ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";

interface OTPFormProps {
    sessionId: string;
    onSuccess: () => void;
    onResend: () => void;
    maskedEmail?: string;
}

export function OTPForm({ sessionId, onSuccess, onResend, maskedEmail }: OTPFormProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { verifyOTP } = useAuth();

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            setError("Please enter the complete 6-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            await verifyOTP(sessionId, otpString);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid OTP");
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        setError("");
        onResend();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
                <div className="h-12 w-12 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <KeyRound className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Enter OTP
                </h3>
                {maskedEmail && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        We sent a code to {maskedEmail}
                    </p>
                )}
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={isLoading}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 outline-none transition-all disabled:opacity-50"
                    />
                ))}
            </div>

            {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    <>
                        Verify OTP
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
                {countdown > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Resend OTP in <span className="font-semibold">{countdown}s</span>
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        className="text-sm text-zinc-900 dark:text-zinc-100 hover:underline inline-flex items-center gap-1"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Resend OTP
                    </button>
                )}
            </div>
        </form>
    );
}
