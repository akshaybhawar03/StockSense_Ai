import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { api } from "../services/api";

export interface User {
    id?: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (username: string, password: string, name?: string) => Promise<void>;
    register: (name: string, email: string, password: string, confirmPassword?: string, inviteCode?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore login from localStorage
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const userEmail = localStorage.getItem("userEmail");
        const userName = localStorage.getItem("userName");

        if (token && userEmail) {
            setUser({ email: userEmail, name: userName || undefined });
        }

        setIsLoading(false);
    }, []);

    // ---------------- LOGIN ----------------
    const login = async (email: string, password: string, name?: string) => {
        setIsLoading(true);

        try {
            // Send email and password as JSON format
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const token = response.data.access_token;

            if (!token) throw new Error("No token received");

            localStorage.setItem("access_token", token);
            localStorage.setItem("userEmail", email);
            if (name) {
                localStorage.setItem("userName", name);
            }

            setUser({ email, name });
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------- REGISTER ----------------
    const register = async (name: string, email: string, password: string, confirmPassword?: string, inviteCode?: string) => {
        setIsLoading(true);

        try {
            await api.post("/auth/register", {
                full_name: name,
                email,
                password,
                confirm_password: confirmPassword || password,
                invite_code: inviteCode,
            });

            // After register redirect to login
            console.log("Registration successful");
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------- LOGOUT ----------------
    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        setUser(null);
    };

    const contextValue = useMemo(
        () => ({ isLoggedIn: !!user, user, login, register, logout, isLoading }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, isLoading]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// ---------------- HOOK ----------------
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}