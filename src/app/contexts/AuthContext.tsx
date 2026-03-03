import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
    id?: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (email: string, password?: string) => Promise<void>;
    register: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            const userEmail = localStorage.getItem('userEmail');

            if (token && userEmail) {
                // If there was a /me endpoint we could verify it here,
                // but since we just have the token, we'll restore state locally
                setUser({ email: userEmail });

                // Optional: Verify token with backend
                // try {
                //     const response = await api.get('/me');
                //     setUser(response.data);
                // } catch (err) {
                //     logout();
                // }
            } else {
                logout();
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            // Many FastAPI setups use OAuth2PasswordRequestForm.
            // But standard user implementations might just use JSON. Let's send a standard JSON payload.
            const response = await api.post('/auth/login', { email, password });


            const accessToken = response.data.access_token || response.data.token;

            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('userEmail', email);
                setUser({ email });
            } else {
                throw new Error("No access token provided.");
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            await api.post('/auth/register', { email, password });
            // Don't auto-login unless required, redirect to login page instead
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('userEmail');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
