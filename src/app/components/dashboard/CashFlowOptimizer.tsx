import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer
} from 'recharts';
import { DollarSign, ShieldAlert, RefreshCw, TrendingUp, BarChart3, Presentation } from 'lucide-react';

interface CashFlowOptimizerProps {
    healthData: any;
}

export function CashFlowOptimizer({ healthData }: CashFlowOptimizerProps) {
    const isLoading = !healthData;

    const formatCurrency = (val: number) => {
        if (!val && val !== 0) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${Number(val).toFixed(0)}`;
    };

    const score = healthData?.overall_score || 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />

                {/* Issue 2: show skeleton while data is loading */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Presentation className="w-8 h-8 text-[rgb(var(--accent-primary))]" />
                                Inventory Health Score
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                                SmartGodown analyzes how your money is trapped inside inventory and shows how much cash you can recover.
                            </p>
                        </div>

                        <div className="flex items-center gap-6 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm backdrop-blur-md">
                            <div className="relative flex items-center justify-center">
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="45" fill="none"
                                        stroke="#1e293b" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="45" fill="none"
                                        stroke={scoreColor} strokeWidth="10"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        transform="rotate(-90 60 60)" />
                                    <text x="60" y="55" textAnchor="middle"
                                        fill="white" fontSize="20" fontWeight="700">{score}</text>
                                    <text x="60" y="72" textAnchor="middle"
                                        fill="#64748b" fontSize="10">
                                        {healthData?.score_label || 'No Data'}
                                    </text>
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Overall Score</div>
                                <div className={`font-semibold text-sm`} style={{ color: scoreColor }}>
                                    {healthData?.score_label || 'Calculating...'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {[
                            { label: 'Total Value', value: formatCurrency(healthData?.total_value), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
                            { label: 'Dead Stock', value: formatCurrency(healthData?.dead_stock_value), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
                            { label: 'Recoverable', value: formatCurrency(healthData?.recoverable_value), icon: RefreshCw, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
                            { label: 'Turnover Ratio', value: `${healthData?.turnover_ratio || 0}x`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
                            { label: 'Next 30D Sales', value: formatCurrency(healthData?.next_30d_sales), icon: BarChart3, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' }
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
                            <ResponsiveContainer width="100%" height={120}>
                                <BarChart data={healthData?.capital_distribution || []}
                                    margin={{ top:5, right:10, left:10, bottom:5 }} layout="vertical">
                                    <XAxis type="number"
                                        tickFormatter={v => '₹'+(v/100000).toFixed(1)+'L'}
                                        tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} />
                                    <YAxis type="category" dataKey="name"
                                        tick={{ fill:'#94a3b8', fontSize:11 }} width={90} axisLine={false} />
                                    <Tooltip
                                        formatter={(v: any) => ['₹'+Number(v).toLocaleString('en-IN'), 'Value']}
                                        contentStyle={{
                                            background:'#1e293b', border:'1px solid #334155', borderRadius:8, color: '#f8fafc'
                                        }} 
                                        itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="value" radius={[0,6,6,0]}>
                                        {(healthData?.capital_distribution || []).map((entry: any, i: number) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
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
                                    {healthData?.ai_insight || 'Analyzing your inventory data...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}



