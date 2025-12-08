"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PhoneForm } from "./PhoneForm";
import { OTPForm } from "./OTPForm";
import { RegisterForm } from "./RegisterForm";
import { useAuth } from "./AuthProvider";

type AuthStep = "phone" | "otp" | "register";

interface AuthModalProps {
    onAuthSuccess: () => void;
}

export function AuthModal({ onAuthSuccess }: AuthModalProps) {
    const [step, setStep] = useState<AuthStep>("phone");
    const [sessionId, setSessionId] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [maskedEmail, setMaskedEmail] = useState<string>("");
    const { login } = useAuth();

    const handlePhoneSuccess = (newSessionId: string) => {
        setSessionId(newSessionId);
        setStep("otp");
    };

    const handleRegisterNeeded = (phoneNumber: string) => {
        setPhone(phoneNumber);
        setStep("register");
    };

    const handleRegisterSuccess = (newSessionId: string) => {
        setSessionId(newSessionId);
        setStep("otp");
    };

    const handleOTPSuccess = () => {
        onAuthSuccess();
    };

    const handleResendOTP = async () => {
        if (phone) {
            try {
                const result = await login(phone);
                if (result.sessionId) {
                    setSessionId(result.sessionId);
                }
            } catch (error) {
                console.error("Resend OTP error:", error);
            }
        }
    };

    const handleBack = () => {
        setStep("phone");
        setPhone("");
        setSessionId("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
            </div>

            <Card className="relative w-full max-w-md p-8 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl">
                        <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome to ChatBot
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {step === "phone" && "Enter your phone number to continue"}
                        {step === "register" && "Create your account"}
                        {step === "otp" && "Verify your identity"}
                    </p>
                </div>

                {/* Forms */}
                {step === "phone" && (
                    <PhoneForm
                        onSuccess={handlePhoneSuccess}
                        onRegisterNeeded={handleRegisterNeeded}
                    />
                )}

                {step === "register" && (
                    <RegisterForm
                        phone={phone}
                        onSuccess={handleRegisterSuccess}
                        onBack={handleBack}
                    />
                )}

                {step === "otp" && (
                    <OTPForm
                        sessionId={sessionId}
                        onSuccess={handleOTPSuccess}
                        onResend={handleResendOTP}
                        maskedEmail={maskedEmail}
                    />
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        By continuing, you agree to our Terms of Service
                    </p>
                </div>
            </Card>
        </div>
    );
}
