import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { BrainCircuit, AlertTriangle, ShieldCheck, Clock, Settings2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function ReorderPredictor() {
    const { inventory } = useData();
    const [autoReorderEnabled, setAutoReorderEnabled] = useState(false);

    const { skus, demandData } = useMemo(() => {
        // Generate AI predictions based on inventory
        const lowStockItems = inventory.filter(item => item.stock <= 20); // Arbitrary threshold for safety stock warning

        const predictedSkus = lowStockItems.map(item => {
            const dailySales = item.sales > 0 ? Number((item.sales / 30).toFixed(1)) : 0.5; // Simulate daily sales
            const leadTime = Math.floor(Math.random() * 10) + 3; // Mock lead time 3-13 days
            const safetyStock = Math.floor(dailySales * leadTime * 1.5);

            let outOfStockDays = 0;
            if (dailySales > 0) {
                outOfStockDays = Math.floor(item.stock / dailySales);
            } else {
                outOfStockDays = 999;
            }

            let urgency = 'Safe';
            if (outOfStockDays <= leadTime) urgency = 'Critical';
            else if (outOfStockDays <= leadTime + 5) urgency = 'Urgent';
            else if (outOfStockDays <= leadTime + 15) urgency = 'Moderate';

            const recommendation = Math.max(safetyStock * 2 - item.stock, 0) || 50; // Simple reorder formula

            return {
                id: item.id,
                name: item.name || item.sku,
                stock: item.stock,
                dailySales,
                leadTime,
                safetyStock,
                outOfStockDays,
                urgency,
                recommendation: Math.ceil(recommendation)
            };
        });

        // Sort by urgency
        const urgencyWeight: Record<string, number> = { 'Critical': 4, 'Urgent': 3, 'Moderate': 2, 'Safe': 1 };
        predictedSkus.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

        // Mock aggregate demand data overall for the chart
        const totalSalesVolume = inventory.reduce((sum, item) => sum + item.sales, 0);
        const baseDemand = totalSalesVolume > 0 ? Math.floor(totalSalesVolume / 30) : 50;

        const dData = [
            { day: '-30', actual: Math.floor(baseDemand * 0.8), predicted: null },
            { day: '-20', actual: Math.floor(baseDemand * 0.95), predicted: null },
            { day: '-10', actual: Math.floor(baseDemand * 0.9), predicted: null },
            { day: '0', actual: baseDemand, predicted: baseDemand },
            { day: '+10', actual: null, predicted: Math.floor(baseDemand * 1.1) },
            { day: '+20', actual: null, predicted: Math.floor(baseDemand * 1.25) },
            { day: '+30', actual: null, predicted: Math.floor(baseDemand * 1.35) },
        ];

        return { skus: predictedSkus.slice(0, 5), demandData: dData };
    }, [inventory]);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'Critical': return 'bg-red-500 shadow-red-500/30';
            case 'Urgent': return 'bg-green-500 shadow-green-500/30';
            case 'Moderate': return 'bg-green-500 shadow-green-500/30';
            case 'Safe': return 'bg-green-500 shadow-green-500/30';
            default: return 'bg-gray-500';
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <Card className="p-6 md:p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t-4 border-t-[rgb(var(--accent-primary))] shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                            AI Reorder Prediction Engine
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Forecasting stock-outs before they happen to ensure uninterrupted sales.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Settings2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Auto-Reorder</span>
                        <Switch checked={autoReorderEnabled} onCheckedChange={setAutoReorderEnabled} />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                    <TableRow>
                                        <TableHead className="w-[200px]">Product</TableHead>
                                        <TableHead>Metrics (Cur / Avg / Lead / Safe)</TableHead>
                                        <TableHead>Urgency</TableHead>
                                        <TableHead className="text-right">Recommendation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {skus.length > 0 ? skus.map((sku) => (
                                        <TableRow key={sku.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                            <TableCell className="font-semibold align-top">
                                                <div className="block">{sku.name}</div>
                                                <div className="flex items-center mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Stock-out in {sku.outOfStockDays} days
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <div>Stock: <strong className="text-gray-900 dark:text-gray-100">{sku.stock}</strong></div>
                                                    <div>Sales/d: <strong className="text-gray-900 dark:text-gray-100">{sku.dailySales}</strong></div>
                                                    <div>Lead: <strong className="text-gray-900 dark:text-gray-100">{sku.leadTime}d</strong></div>
                                                    <div>Safe: <strong className="text-gray-900 dark:text-gray-100">{sku.safetyStock}</strong></div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top pt-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full shadow-lg ${getUrgencyColor(sku.urgency)}`} />
                                                    <span className="text-sm font-medium">{sku.urgency}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-top">
                                                <div className="inline-flex flex-col items-end">
                                                    <Badge variant="secondary" className="bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/20 px-3 py-1 text-sm font-bold">
                                                        Order {sku.recommendation} units
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-6">All stock levels are perfectly healthy!</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Sales vs Predicted Demand
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Last 30 Days & Next 30 Days</p>

                        <div className="flex-grow min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={demandData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: '#6b7280', marginBottom: '4px' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                                    <Line type="monotone" dataKey="actual" name="Actual Sales" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="predicted" name="AI Predicted" stroke="rgb(var(--accent-primary))" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
