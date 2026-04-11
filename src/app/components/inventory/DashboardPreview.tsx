import React from 'react';
import { useData } from '../../contexts/DataContext';
import { PredictionChart } from './PredictionChart';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { Package, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router';

export function DashboardPreview() {
    const { kpis, sales, isLoadingData } = useData();

    if (isLoadingData) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

    const kpisData = [
        { label: 'Total Products', value: kpis.totalProducts.toLocaleString(), icon: Package, color: 'blue' },
        { label: 'Inventory Value', value: `₹${(kpis.inventoryValue || 0).toLocaleString()}`, icon: DollarSign, color: 'green' },
        { label: 'Low Stock Alerts', value: kpis.lowStock, icon: AlertTriangle, color: 'orange' },
        { label: 'Out of Stock', value: kpis.outOfStock, icon: Activity, color: 'red' },
    ];

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Smart Dashboard</h2>
                <div className="flex gap-3">
                    <Link to="/inventory">
                        <Button variant="outline">Manage Inventory</Button>
                    </Link>
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md">Generate Report</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpisData.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    const bgColors = {
                        blue: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
                        green: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
                        orange: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
                        red: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                    };

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-6 hover:shadow-xl transition-shadow backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${bgColors[kpi.color as keyof typeof bgColors]}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PredictionChart />
                </div>
                <div className="lg:col-span-1">
                    <Card className="p-6 h-full bg-white/90 dark:bg-gray-900/90 border-gray-100 dark:border-gray-800 shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-gray-400" /> Recent Movements</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {sales.slice(0, 10).map((mov) => (
                                <div key={mov.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Sale: {mov.sku}</p>
                                            <p className="text-xs text-gray-500">{new Date(mov.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        -{mov.quantity}
                                    </div>
                                </div>
                            ))}
                            {sales.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No recent activity</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
