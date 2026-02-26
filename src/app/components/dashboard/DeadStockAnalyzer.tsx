import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { PackageX, Archive, AlertOctagon, AlertTriangle, Package } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function DeadStockAnalyzer() {
    const { inventory, kpis } = useData();

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val.toFixed(0)}`;
    };

    const { metrics, distributionData, deadStockItems } = useMemo(() => {
        let healthy = 0, slowMoving = 0, risk = 0, dead = 0;
        const deadItems: any[] = [];

        inventory.forEach(item => {
            const val = item.stock * item.price;
            if (item.stock === 0) return; // Skip out of stock

            // Generate some mock intelligence since CSV doesn't have real "days without sale"
            // For a real app, this would query the `sales` table for the last sale date.
            const daysWithoutSale = item.sales === 0 ? Math.floor(Math.random() * 60) + 90 : Math.floor(Math.random() * 30);

            if (daysWithoutSale > 90 || (item.sales === 0 && item.stock > 10)) {
                dead++;
                deadItems.push({
                    id: item.id,
                    sku: item.sku,
                    days: daysWithoutSale,
                    qty: item.stock,
                    value: val,
                    action: val > 1000 ? 'Liquidate' : 'Discount 40%'
                });
            } else if (daysWithoutSale > 60) {
                risk++;
            } else if (daysWithoutSale > 30) {
                slowMoving++;
            } else {
                healthy++;
            }
        });

        // Sort dead items by highest value
        deadItems.sort((a, b) => b.value - a.value);

        const dist = [
            { name: 'Healthy', value: healthy || 1, color: '#10b981' },
            { name: 'Slow Moving', value: slowMoving || 0, color: '#eab308' },
            { name: 'Risk', value: risk || 0, color: '#f97316' },
            { name: 'Dead Stock', value: dead || 0, color: '#ef4444' },
        ].filter(d => d.value > 0);

        const m = [
            { label: 'Total Units', value: inventory.reduce((sum, item) => sum + item.stock, 0).toLocaleString(), icon: Package, color: 'blue' },
            { label: 'Total Value', value: formatCurrency(kpis.inventoryValue), icon: Archive, color: 'purple' },
            { label: 'Low Stock', value: kpis.lowStock.toString(), icon: AlertTriangle, color: 'yellow' },
            { label: 'Overstocked', value: risk.toString(), icon: AlertOctagon, color: 'orange' },
            { label: 'Dead Stock', value: dead.toString(), icon: PackageX, color: 'red' },
        ];

        return { metrics: m, distributionData: dist, deadStockItems: deadItems.slice(0, 5) };
    }, [inventory, kpis]);

    const getAgingColor = (days: number) => {
        if (days >= 90) return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
        if (days >= 45) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
        if (days >= 15) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="p-6 md:p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
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
                                        {deadStockItems.length > 0 ? deadStockItems.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                <TableCell className="font-semibold">{item.sku}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getAgingColor(item.days)}`}>
                                                        {item.days} days
                                                    </span>
                                                </TableCell>
                                                <TableCell>{item.qty}</TableCell>
                                                <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                                                    {formatCurrency(item.value)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--accent-primary))]">
                                                        <span>⚡</span> {item.action}
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
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#111827', fontWeight: 600 }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
