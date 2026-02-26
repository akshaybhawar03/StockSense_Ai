import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, ShieldAlert, RefreshCw, TrendingUp, BarChart3, Presentation } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function CashFlowOptimizer() {
    const { inventory, kpis } = useData();

    // Calculate dynamic values
    const { blocked, active, recoverable, next30DSales } = useMemo(() => {
        let blockedVal = 0;
        let activeVal = 0;
        let next30 = 0;

        inventory.forEach(item => {
            const val = item.stock * item.price;
            if (item.sales === 0 && item.stock > 10) {
                blockedVal += val;
            } else {
                activeVal += val;
            }
            // Naive projection: if they sold 'sales' in the past period, they might sell the same in next 30D
            next30 += (item.sales * item.price);
        });

        // Assume we can recover 50% of blocked capital by liquidation
        const rec = blockedVal * 0.5;

        return { blocked: blockedVal, active: activeVal, recoverable: rec, next30DSales: next30 };
    }, [inventory]);

    const totalVal = blocked + active;
    const healthScore = totalVal > 0 ? Math.round((active / totalVal) * 100) : 0;

    const healthData = [
        { name: 'Score', value: healthScore },
        { name: 'Remaining', value: 100 - healthScore }
    ];

    const capitalData = [
        { name: 'Categories', blocked: blocked, active: active }
    ];

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val.toFixed(0)}`;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Presentation className="w-8 h-8 text-[rgb(var(--accent-primary))]" />
                                Inventory Health Score
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                                Stock Sense analyzes how your money is trapped inside inventory and shows how much cash you can recover.
                            </p>
                        </div>

                        <div className="flex items-center gap-6 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm backdrop-blur-md">
                            <div className="relative w-24 h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={healthData} cx="50%" cy="50%" innerRadius={30} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                                            <Cell fill="rgb(var(--accent-primary))" />
                                            <Cell fill="rgba(156, 163, 175, 0.2)" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{healthScore}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Overall Score</div>
                                <div className={`font-semibold text-sm ${healthScore > 70 ? 'text-green-600 dark:text-green-400' : healthScore > 40 ? 'text-orange-500' : 'text-red-500'}`}>
                                    {healthScore > 70 ? 'Good Health' : healthScore > 40 ? 'Fair Health' : 'Poor Health'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {[
                            { label: 'Total Value', value: formatCurrency(totalVal), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
                            { label: 'Dead Stock', value: formatCurrency(blocked), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
                            { label: 'Recoverable', value: formatCurrency(recoverable), icon: RefreshCw, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
                            { label: 'Turnover Ratio', value: `${kpis.turnoverRate}x`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
                            { label: 'Next 30D Sales', value: formatCurrency(next30DSales), icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' }
                        ].map((stat, idx) => (
                            <motion.div key={idx} whileHover={{ y: -5 }} className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/20 dark:border-gray-700/50 shadow-sm backdrop-blur-md">
                                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-white/20 dark:border-gray-700/50">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Capital Distribution (Blocked vs Active)</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={capitalData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.1} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" hide />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="active" name="Active Capital (₹)" fill="rgb(var(--accent-primary))" radius={[0, 4, 4, 0]} barSize={30} />
                                        <Bar dataKey="blocked" name="Blocked Capital (₹)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl p-6 border border-[rgb(var(--accent-primary))]/30 bg-gradient-to-br from-[rgb(var(--accent-primary))]/10 to-transparent">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <RefreshCw className="w-24 h-24" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--accent-primary))]/20 text-[rgb(var(--accent-primary))] font-medium text-xs mb-4 w-fit">
                                    ✨ AI Insight of the Day
                                </div>
                                <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                                    "You can unlock{" "}
                                    <span className="text-[rgb(var(--accent-primary))]">{formatCurrency(recoverable)}</span>{" "}
                                    by liquidating your lowest performing SKUs."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
