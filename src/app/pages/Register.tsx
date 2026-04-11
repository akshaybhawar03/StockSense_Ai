import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, TrendingUp, BarChart3, Database } from "lucide-react";

export function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
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

        if (!name || !email || !password || !confirmPassword) {
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
            await register(name, email, password);

            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err: any) {
            console.error("Register error:", err);

            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    setError(detail[0]?.msg || "Validation error");
                } else if (typeof detail === "string") {
                    setError(detail);
                } else {
                    setError("Unknown registration error");
                }
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
            {/* Left Side: Info & Branding */}
            <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-[#0b1326] relative flex-col justify-between overflow-hidden shadow-2xl">
                
                {/* Background Ambient Glows */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[rgb(var(--accent-primary))]/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Top Section */}
                <div className="relative z-10 p-10 lg:p-14 h-full flex flex-col justify-center">
                    <Link to="/" className="flex items-center space-x-3 mb-16 inline-flex absolute top-10 left-10">
                        <div className="w-12 h-12 flex items-center justify-center bg-white p-2 rounded-xl shadow-lg">
                            <img src="/logos/main-logo.jpeg" alt="SmartGodown Logo" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <span className="font-bold text-2xl text-white tracking-tight">SmartGodown</span>
                    </Link>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="mt-20"
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                            Your Godown. <br />
                            <span className="text-[rgb(var(--accent-primary))]">Always in Control.</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-md font-light leading-relaxed mb-10">
                            Eliminate dead stock. Optimize cash flow. Maximize revenue with AI-powered predictive analytics.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[rgb(var(--accent-primary))]/10 flex items-center justify-center border border-[rgb(var(--accent-primary))]/20">
                                    <BarChart3 className="w-5 h-5 text-[rgb(var(--accent-primary))]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm">Real-time Insights</h4>
                                    <p className="text-gray-500 text-sm">Live tracking of inventory flow</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[rgb(var(--accent-primary))]/10 flex items-center justify-center border border-[rgb(var(--accent-primary))]/20">
                                    <TrendingUp className="w-5 h-5 text-[rgb(var(--accent-primary))]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm">Profit Optimization</h4>
                                    <p className="text-gray-500 text-sm">Capital recovery suggestions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[rgb(var(--accent-primary))]/10 flex items-center justify-center border border-[rgb(var(--accent-primary))]/20">
                                    <Database className="w-5 h-5 text-[rgb(var(--accent-primary))]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm">AI Forecasting</h4>
                                    <p className="text-gray-500 text-sm">Predictive demand analysis</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-white">
                
                {/* Mobile Header */}
                <div className="md:hidden absolute top-6 left-6 right-6 flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 flex items-center justify-center bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        <img src="/logos/main-logo.jpeg" alt="SmartGodown Logo" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <span className="font-bold text-2xl text-gray-900 tracking-tight">SmartGodown</span>
                </div>

                <div className="w-full max-w-md mt-16 md:mt-0">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create an account</h2>
                            <p className="text-gray-500 text-[15px]">Join SmartGodown to optimize your inventory flow.</p>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-green-50 text-green-600 text-sm font-medium border border-green-100 flex items-start gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{success}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">

                            <div className="group">
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name</label>
                                <Input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-[rgb(var(--accent-primary))] transition-all text-base shadow-sm"
                                />
                            </div>
                            
                            <div className="group">
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email address</label>
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-[rgb(var(--accent-primary))] transition-all text-base shadow-sm"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-[rgb(var(--accent-primary))] transition-all text-base shadow-sm pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 focus:border-[rgb(var(--accent-primary))] transition-all text-base shadow-sm"
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 rounded-xl bg-[#0b1326] hover:bg-gray-800 text-white font-medium text-[15px] transition-all flex items-center justify-center border border-transparent shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Register"
                                    )}
                                </Button>
                            </div>

                            <div className="text-center pt-6 pb-4">
                                <span className="text-gray-500 text-[15px]">
                                    Already have an account?
                                </span>
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="ml-2 text-[rgb(var(--accent-primary))] font-semibold hover:underline bg-transparent transition-colors"
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
                
                {/* Footer Text on Desktop */}
                <div className="hidden md:block absolute bottom-6 right-8 text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} SmartGodown System. All rights reserved.
                </div>
            </div>
        </div>
    );
}
