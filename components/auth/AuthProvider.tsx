"use client";

import React, { useState, createContext, useContext, useEffect, ReactNode } from "react";

interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (phone: string) => Promise<{ exists: boolean; sessionId?: string; message: string }>;
    verifyOTP: (sessionId: string, otp: string) => Promise<{ success: boolean; message: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; sessionId?: string; message: string }>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

interface RegisterData {
    name: string;
    phone: string;
    email: string;
    address?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSession = async () => {
        try {
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            if (data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Session refresh error:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);

    const login = async (phone: string) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Login failed");
        }

        return data;
    };

    const verifyOTP = async (sessionId: string, otp: string) => {
        const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, otp }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Verification failed");
        }

        if (data.success) {
            setUser(data.user);
        }

        return data;
    };

    const register = async (registerData: RegisterData) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerData),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Registration failed");
        }

        return data;
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                verifyOTP,
                register,
                logout,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
