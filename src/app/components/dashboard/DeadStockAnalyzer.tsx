import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { PackageX, Archive, AlertOctagon, AlertTriangle, Package } from 'lucide-react';

interface DeadStockAnalyzerProps {
    deadStockData: any;
}

export function DeadStockAnalyzer({ deadStockData }: DeadStockAnalyzerProps) {
    const isLoading = !deadStockData;

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val.toFixed(0)}`;
    };

    const metrics = [
        { label: 'Total Units', value: (deadStockData?.stats?.total_units || 0).toLocaleString(), icon: Package, color: 'blue' },
        { label: 'Total Value', value: formatCurrency(deadStockData?.stats?.total_value || 0), icon: Archive, color: 'purple' },
        { label: 'Low Stock', value: (deadStockData?.stats?.low_stock || 0).toString(), icon: AlertTriangle, color: 'yellow' },
        { label: 'Overstocked', value: (deadStockData?.stats?.overstocked || 0).toString(), icon: AlertOctagon, color: 'orange' },
        { label: 'Dead Stock', value: (deadStockData?.stats?.dead_stock || 0).toString(), icon: PackageX, color: 'red' },
    ];

    const deadStockItems = deadStockData?.dead_stock_items || [];
    const distributionData = deadStockData?.health_distribution || [];

    const getAgingColor = (days: number) => {
        if (days >= 90) return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
        if (days >= 45) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
        if (days >= 15) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="p-6 md:p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                {/* Issue 2: show spinner overlay while data is loading */}
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl">
                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing dead stock…</p>
                    </div>
                )}

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

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-2xl -m-2 p-2 -z-10" />
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
                                        {deadStockItems.length > 0 ? deadStockItems.map((item: any, i: number) => (
                                            <TableRow key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                <TableCell className="font-semibold">{item.name}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getAgingColor(item.days_without_sale)}`}>
                                                        {item.days_without_sale} days
                                                    </span>
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                                                    ₹{Number(item.blocked_capital || 0).toLocaleString('en-IN')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--accent-primary))]">
                                                        <span>⚡</span> {item.ai_suggestion}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-gray-500 py-6">No dead stock detected. Great job!</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
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
