import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!email) {
            alert('Please enter an email.');
            return;
        }

        try {
            await login(email);
            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            alert('Failed to login. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-600 font-bold mb-2">
                        Operating System For Ecommerce
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Sign in with your EasyEcom account.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-8 sm:p-10 bg-white dark:bg-gray-800 shadow-2xl border-0 rounded-2xl relative overflow-hidden">

                        {/* Logo placeholder matching user image */}
                        <div className="flex justify-center mb-10">
                            <div className="relative w-32 h-32 flex flex-col items-center justify-center">
                                {/* Simplified visual recreation of the logo */}
                                <svg viewBox="0 0 100 100" className="w-full h-full text-teal-600">
                                    <path d="M50 10 L10 32 L10 68 L50 90 L90 68 L90 32 Z" fill="currentColor" />
                                    <path d="M50 30 L20 46 L50 63 L80 46 Z" fill="white" />
                                    <path d="M50 48 L20 64 L50 81 L80 64 Z" fill="white" />
                                </svg>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-6 text-lg font-medium bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded-lg transition-colors border-0"
                            >
                                Continue
                            </Button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-bold uppercase">
                                        OR
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleLogin}
                                variant="outline"
                                className="w-full py-6 text-base font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-3 rounded-lg shadow-sm"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                Continue with Google
                            </Button>

                            <Button
                                type="button"
                                onClick={handleLogin}
                                variant="outline"
                                className="w-full py-6 text-base font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-3 rounded-lg shadow-sm"
                            >
                                <img src="https://www.svgrepo.com/show/475666/microsoft-color.svg" alt="Microsoft" className="w-5 h-5" />
                                Continue with Microsoft
                            </Button>

                            <div className="pt-6 text-center">
                                <a href="#" className="text-[#337ab7] hover:underline text-sm font-medium">
                                    Do not have an account?
                                </a>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
