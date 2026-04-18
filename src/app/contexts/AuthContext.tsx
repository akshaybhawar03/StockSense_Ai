import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    api,
    setAccessToken,
    setRefreshToken,
    getRefreshToken,
    clearAuthTokens,
} from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'https://stocksense-backend-wijr.onrender.com/api/v1';

export interface User {
    id?: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, confirmPassword?: string, inviteCode?: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Silent refresh on app load ─────────────────────────────────────────────
    useEffect(() => {
        const silentRefresh = async () => {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await axios.post(`${API_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                setAccessToken(data.access_token);
                if (data.refresh_token) setRefreshToken(data.refresh_token);

                const email = localStorage.getItem("userEmail") || "";
                const name = localStorage.getItem("userName") || undefined;
                setUser({ email, name });
            } catch {
                // Refresh token invalid/expired — clear everything
                clearAuthTokens();
            } finally {
                setIsLoading(false);
            }
        };

        silentRefresh();
    }, []);

    // ── LOGIN ──────────────────────────────────────────────────────────────────
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });

            if (!data.access_token) throw new Error("No access token received");

            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token ?? null);

            localStorage.setItem("userEmail", email);
            if (data.user?.name) localStorage.setItem("userName", data.user.name);

            setUser({ email, name: data.user?.name });
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ── REGISTER ───────────────────────────────────────────────────────────────
    const register = async (
        name: string,
        email: string,
        password: string,
        confirmPassword?: string,
        inviteCode?: string
    ) => {
        setIsLoading(true);
        try {
            await api.post("/auth/register", {
                full_name: name,
                email,
                password,
                confirm_password: confirmPassword || password,
                invite_code: inviteCode,
            });
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ── LOGOUT ─────────────────────────────────────────────────────────────────
    const logout = async () => {
        const refreshToken = getRefreshToken();
        try {
            if (refreshToken) {
                await api.post("/auth/logout", { refresh_token: refreshToken });
            }
        } catch {
            // Best-effort — proceed with local cleanup regardless
        } finally {
            clearAuthTokens();
            setUser(null);
        }
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
