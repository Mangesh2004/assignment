"use client";

import React, { useState } from "react";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthProvider";

interface PhoneFormProps {
    onSuccess: (sessionId: string) => void;
    onRegisterNeeded: (phone: string) => void;
}

export function PhoneForm({ onSuccess, onRegisterNeeded }: PhoneFormProps) {
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!/^[0-9]{10}$/.test(phone)) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        try {
            const result = await login(phone);

            if (result.exists && result.sessionId) {
                onSuccess(result.sessionId);
            } else {
                onRegisterNeeded(phone);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                </label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="tel"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="pl-11"
                        disabled={isLoading}
                    />
                </div>
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking...
                    </>
                ) : (
                    <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
