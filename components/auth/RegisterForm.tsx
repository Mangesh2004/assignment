"use client";

import React, { useState } from "react";
import { User, Mail, MapPin, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthProvider";

interface RegisterFormProps {
    phone: string;
    onSuccess: (sessionId: string) => void;
    onBack: () => void;
}

export function RegisterForm({ phone, onSuccess, onBack }: RegisterFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (name.trim().length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            const result = await register({ name, phone, email, address });
            if (result.success && result.sessionId) {
                onSuccess(result.sessionId);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            <div className="text-center mb-6">
                <div className="h-12 w-12 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <User className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Register with phone: {phone}
                </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-11"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11"
                        disabled={isLoading}
                    />
                </div>
                <p className="text-xs text-gray-400">OTP will be sent to this email</p>
            </div>

            {/* Address */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Enter your address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-11"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                    </>
                ) : (
                    <>
                        Register & Get OTP
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
