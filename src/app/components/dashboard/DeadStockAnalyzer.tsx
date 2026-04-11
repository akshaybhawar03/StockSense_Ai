import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { PackageX, Archive, AlertOctagon, AlertTriangle } from 'lucide-react';
import type { DeadStockAnalysis, DeadStockItem } from '../../services/dashboard';

// ── Helper functions for days_without_sale rendering ──────────────
function formatDaysWithoutSale(days: number | null): string {
    if (days === null || days === undefined) return 'No sales recorded';
    return `${days} days`;
}

function getDaysBadgeStyle(days: number | null): string {
    if (days === null || days === undefined)
        return 'bg-gray-800 text-gray-400 border border-gray-600';
    if (days > 180)
        return 'bg-red-900/30 text-red-400 border border-red-700';
    if (days > 90)
        return 'bg-green-900/30 text-green-400 border border-green-700';
    if (days > 30)
        return 'bg-green-900/30 text-green-400 border border-green-700';
    return 'bg-green-900/30 text-green-400 border border-green-700';
}

// ── AI suggestion color ──────────────────────────────────────────
function getSuggestionColor(suggestion: string): string {
    if (suggestion.includes('Liquidate')) return 'text-red-400';
    if (suggestion.includes('High priority')) return 'text-green-400';
    if (suggestion.includes('Never sold')) return 'text-gray-400';
    return 'text-green-400';
}

interface DeadStockAnalyzerProps {
    deadStockData: DeadStockAnalysis | null | undefined;
    isLoading: boolean;
    isError: boolean;
}

export function DeadStockAnalyzer({ deadStockData, isLoading, isError }: DeadStockAnalyzerProps) {
    const [showAll, setShowAll] = useState(false);

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val.toFixed(0)}`;
    };

    // ── Early returns for loading / error / empty ────────────────
    if (isLoading) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                <Card className="p-6 md:p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing dead stock…</p>
                    </div>
                </Card>
            </motion.div>
        );
    }

    if (isError) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                <Card className="p-6 md:p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                    <div className="text-center py-8 text-red-400">
                        Failed to load dead stock data. Please refresh.
                    </div>
                </Card>
            </motion.div>
        );
    }

    // ── Data is loaded — extract values from API response ────────
    const summary = deadStockData?.summary;
    const deadStockItems: DeadStockItem[] = deadStockData?.items || [];
    const displayedItems = showAll ? deadStockItems : deadStockItems.slice(0, 20);
    const hasMore = deadStockItems.length > 20;

    const metrics = [
        { label: 'Total Dead Stock', value: (summary?.total_dead_stock ?? 0).toLocaleString(), icon: PackageX, color: 'red' },
        { label: 'Blocked Value', value: formatCurrency(summary?.total_blocked_value ?? 0), icon: Archive, color: 'purple' },
        { label: 'Low Stock', value: (summary?.low_stock ?? 0).toString(), icon: AlertTriangle, color: 'yellow' },
        { label: 'Overstocked', value: (summary?.overstocked ?? 0).toString(), icon: AlertOctagon, color: 'orange' },
    ];

    // Build health distribution from summary for the pie chart
    const distributionData = summary ? [
        { name: 'Dead Stock', value: summary.total_dead_stock, color: '#ef4444' },
        { name: 'Overstocked', value: summary.overstocked, color: '#f97316' },
        { name: 'Low Stock', value: summary.low_stock, color: '#eab308' },
    ].filter(d => d.value > 0) : [];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="p-6 md:p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <PackageX className="w-6 h-6 text-red-500" />
                            Dead Stock Intelligence Engine
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Analyzing inventory behavior and aging to prevent capital lockup.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {metrics.map((metric, idx) => (
                        <motion.div key={idx} whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20 text-${metric.color}-600 dark:text-${metric.color}-400`}>
                                    <metric.icon className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
                                    {metric.label}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {metric.value}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/10 dark:to-green-900/10 rounded-2xl -m-2 p-2 -z-10" />
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">
                                DEAD STOCK ANALYZER
                            </h3>
                            <Badge variant="outline" className="border-red-200 text-red-600 dark:border-red-800 dark:text-red-400">
                                High Priority
                            </Badge>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                        <TableRow>
                                            <TableHead>SKU Name</TableHead>
                                            <TableHead>Days w/o Sale</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Blocked</TableHead>
                                            <TableHead>AI Suggestion</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedItems.length > 0 ? displayedItems.map((item: DeadStockItem, i: number) => (
                                            <TableRow key={item.product_id || i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                <TableCell className="font-semibold">
                                                    <div>
                                                        <div>{item.name}</div>
                                                        <div className="text-xs text-gray-400">{item.sku}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getDaysBadgeStyle(item.days_without_sale)}`}>
                                                        {formatDaysWithoutSale(item.days_without_sale)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{item.current_stock}</TableCell>
                                                <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                                                    ₹{Number(item.blocked_value || 0).toLocaleString('en-IN')}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {item.ai_suggestion ? (
                                                        <span className="flex items-center gap-1">
                                                            <span>⚡</span>
                                                            <span className={getSuggestionColor(item.ai_suggestion)}>
                                                                {item.ai_suggestion}
                                                            </span>
                                                        </span>
                                                    ) : '—'}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <span className="text-green-400">✓ No dead stock detected. Your inventory is healthy!</span>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {hasMore && (
                                <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-gray-800/20">
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors py-1 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {showAll ? 'Show Less' : `See More (${deadStockItems.length - 20} more items)`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
                            Inventory Health Distribution
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={2} dataKey="value"
                                    >
                                        {(distributionData || []).map((entry: any, i: number) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(v: any, n: any) => [v + ' items', n]}
                                        contentStyle={{
                                            background:'#1e293b', border:'1px solid #334155', borderRadius:8
                                        }} />
                                    <Legend
                                        formatter={(v: any) => <span style={{color:'#94a3b8',fontSize:11}}>{v}</span>}
                                        iconType="circle" iconSize={8}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
