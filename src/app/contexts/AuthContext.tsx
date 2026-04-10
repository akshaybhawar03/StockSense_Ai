import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

export interface User {
    id?: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
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

        if (token && userEmail) {
            setUser({ email: userEmail });
        }

        setIsLoading(false);
    }, []);

    // ---------------- LOGIN ----------------
    const login = async (email: string, password: string) => {
        setIsLoading(true);

        try {
            // Reverted back to standard OAuth2 form-data login endpoint because /auth/login/json returned 404 Not Found
            const params = new URLSearchParams();
            params.append("username", email);
            params.append("password", password);

            const response = await api.post("/auth/login", params.toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const token = response.data.access_token;

            if (!token) throw new Error("No token received");

            localStorage.setItem("access_token", token);
            localStorage.setItem("userEmail", email);

            setUser({ email });
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------- REGISTER ----------------
    const register = async (email: string, password: string) => {
        setIsLoading(true);

        try {
            await api.post("/auth/register", {
                email,
                password,
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
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!user,
                user,
                login,
                register,
                logout,
                isLoading,
            }}
        >
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