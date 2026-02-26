import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (email: string, name?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUserId = localStorage.getItem('userId');
            if (storedUserId) {
                try {
                    const foundUser = await db.users.get(storedUserId);
                    if (foundUser) {
                        setUser(foundUser);
                    } else {
                        localStorage.removeItem('userId');
                    }
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, name: string = 'User') => {
        setIsLoading(true);
        try {
            let existingUser = await db.users.where('email').equalsIgnoreCase(email).first();

            if (!existingUser) {
                // Auto-signup if not found
                const newUser: User = {
                    id: uuidv4(),
                    email: email.toLowerCase(),
                    name,
                    passwordHash: 'dummy-hash',
                    createdAt: new Date().toISOString()
                };
                await db.users.add(newUser);
                existingUser = newUser;
            }

            setUser(existingUser);
            localStorage.setItem('userId', existingUser.id);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userId');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout, isLoading }}>
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
