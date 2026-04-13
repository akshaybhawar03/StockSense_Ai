import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { BrainCircuit, AlertTriangle, ShieldCheck, Clock, Settings2, CheckCircle2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function ReorderPredictor() {
    const { inventory } = useData();
    const [autoReorderEnabled, setAutoReorderEnabled] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleToggleAutoReorder = (checked: boolean) => {
        if (checked) {
            setShowConfirmModal(true);
        } else {
            setAutoReorderEnabled(false);
        }
    };

    const confirmAutoReorder = () => {
        setAutoReorderEnabled(true);
        setShowConfirmModal(false);
    };

    const { skus, demandData } = useMemo(() => {
        // Remove the hard filter: analyze everything instead of filtering by stock <= 20
        const predictedSkus = inventory.map(item => {
            const dailySales = item.sales > 0 ? Number((item.sales / 30).toFixed(1)) : 0.5; // Simulate daily sales
            const leadTime = Math.floor(Math.random() * 10) + 3; // Mock lead time 3-13 days
            const safetyStock = Math.floor(dailySales * leadTime * 1.5);
            const reorderPoint = safetyStock;

            let outOfStockDays = 0;
            if (dailySales > 0) {
                outOfStockDays = Math.floor(item.stock / dailySales);
            } else {
                outOfStockDays = 999;
            }

            let urgency = 'SAFE';
            if (outOfStockDays <= leadTime) urgency = 'CRITICAL';
            else if (outOfStockDays <= leadTime + 5) urgency = 'HIGH';
            else if (outOfStockDays <= leadTime + 15) urgency = 'MEDIUM';

            const recommendation = Math.max(safetyStock * 2 - item.stock, 0) || 50; 

            return {
                id: item.id,
                name: item.name || item.sku,
                stock: item.stock,
                reorderPoint,
                dailySales,
                leadTime,
                safetyStock,
                outOfStockDays,
                urgency,
                recommendation: Math.ceil(recommendation)
            };
        });

        // Further filter items out that are completely safe if we only want to show actionable ones
        const actionableSkus = predictedSkus.filter(sku => sku.urgency !== 'SAFE');

        // Sort by urgency matching the requested labels
        const urgencyWeight: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'SAFE': 1 };
        actionableSkus.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

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

        return { skus: actionableSkus.slice(0, 5), demandData: dData };
    }, [inventory]);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'CRITICAL': return 'bg-[#dc2626] text-white';
            case 'HIGH': return 'bg-[#ea580c] text-white';
            case 'MEDIUM': return 'bg-[#ca8a04] text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <Card className="p-6 md:p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t-4 border-t-[rgb(var(--accent-primary))] shadow-xl overflow-hidden relative">
                <AnimatePresence>
                    {showConfirmModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enable Auto-Reorder?</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                                This will allow the AI engine to automatically place orders with your suppliers when stock reaches critical levels. You will be billed for automated purchases.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAutoReorder}
                                    className="px-6 py-2.5 bg-[rgb(var(--accent-primary))] hover:bg-[#059669] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[rgb(var(--accent-primary))]/20"
                                >
                                    Yes, Enable AI Auto-Ordering
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                        <Switch checked={autoReorderEnabled} onCheckedChange={handleToggleAutoReorder} />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                    <TableRow>
                                        <TableHead className="w-[200px]">Product Name</TableHead>
                                        <TableHead>Stock / R.Point / R.Qty</TableHead>
                                        <TableHead>Urgency</TableHead>
                                        <TableHead className="text-right">Recommendation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {skus.length > 0 ? skus.map((sku) => (
                                        <TableRow key={sku.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                            <TableCell className="font-semibold align-top">
                                                <div className="block">{sku.name}</div>
                                                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {sku.outOfStockDays} days to stock-out
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                                                    <div>Curr: <strong className="text-gray-900 dark:text-white">{sku.stock}</strong></div>
                                                    <div className="text-xs text-gray-500">PT: {sku.reorderPoint} &nbsp;|&nbsp; QTY: {sku.recommendation}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top pt-4">
                                                <Badge variant="default" className={`${getUrgencyColor(sku.urgency)} border-0 shadow-sm text-xs font-bold leading-none py-1`}>
                                                    {sku.urgency}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right align-top pt-4">
                                                <div className="inline-flex flex-col text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Order {sku.recommendation} units
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-500">
                                                    <CheckCircle2 className="w-10 h-10 mb-3" />
                                                    <p className="font-medium text-lg">✅ All stock levels are healthy</p>
                                                    <p className="text-sm text-gray-500 mt-1">No items require immediate reordering.</p>
                                                </div>
                                            </TableCell>
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
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', fontSize: '12px', background: '#1e293b', border: '1px solid #334155' }} 
                                        itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }} 
                                    />
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
