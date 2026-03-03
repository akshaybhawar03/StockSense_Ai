import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function Register() {
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(email, password);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to register. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-600 font-bold mb-2">
                        Create an Account
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Join AI Smart Inventory Predictor today.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-8 sm:p-10 bg-white dark:bg-gray-800 shadow-2xl border-0 rounded-2xl relative overflow-hidden">

                        {/* Logo Illustration */}
                        <div className="flex justify-center mb-8">
                            <div className="relative w-24 h-24 flex flex-col items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-teal-500 opacity-20"
                                />
                                <svg viewBox="0 0 100 100" className="w-16 h-16 text-teal-600">
                                    <path d="M50 10 L10 32 L10 68 L50 90 L90 68 L90 32 Z" fill="currentColor" />
                                    <path d="M50 30 L20 46 L50 63 L80 46 Z" fill="white" />
                                    <path d="M50 48 L20 64 L50 81 L80 64 Z" fill="white" />
                                </svg>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-800">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="w-full py-6 text-lg font-medium bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg transition-all shadow-md mt-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Register"
                                )}
                            </Button>

                            <div className="pt-4 text-center">
                                <span className="text-gray-500 text-sm">Already have an account? </span>
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-teal-600 dark:text-teal-400 hover:underline text-sm font-semibold"
                                >
                                    Sign in instead
                                </button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
