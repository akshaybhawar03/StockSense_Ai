import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsSubmitting(true);

        try {
            await register(email, password);

            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err: any) {
            console.error("Register error:", err);

            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-teal-600 mb-2">
                        Create an Account
                    </h1>
                    <p className="text-gray-500">
                        Join AI Smart Inventory Predictor today
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">

                        {error && (
                            <div className="mb-4 p-3 rounded bg-red-100 text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 rounded bg-green-100 text-green-600 text-sm text-center">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Password</label>

                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Minimum 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-bold mb-2">
                                    Confirm Password
                                </label>

                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Register Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white"
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

                            {/* Login Redirect */}
                            <div className="text-center pt-4">
                                <span className="text-gray-500 text-sm">
                                    Already have an account?
                                </span>

                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="ml-2 text-teal-600 hover:underline"
                                >
                                    Sign in
                                </button>
                            </div>

                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
} 