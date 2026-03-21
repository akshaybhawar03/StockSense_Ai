import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/analytics';
import { StockHealthDonut } from '../charts/StockHealthDonut';
import { CategoryBarChart } from '../charts/CategoryBarChart';
import { TopProductsBar } from '../charts/TopProductsBar';
import { LowStockBar } from '../charts/LowStockBar';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, AlertCircle, PieChart } from 'lucide-react';

export function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = () => {
            setLoading(true);
            getAnalytics()
                .then(r => setData(r.data))
                .catch(() => toast.error('Failed to load analytics'))
                .finally(() => setLoading(false));
        };
        
        fetchAnalytics();
        window.addEventListener('csv-uploaded', fetchAnalytics);
        return () => window.removeEventListener('csv-uploaded', fetchAnalytics);
    }, []);

    if (loading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500 h-[60vh]">
                <span className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[rgb(var(--accent-primary))] animate-spin mb-4"></span>
                Loading advanced analytics...
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg ring-1 ring-white/20">
                    <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Data-driven insights to optimize your warehouse operations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Stock Health */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <PieChart className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Stock Health Distribution</h2>
                    </div>
                    <div className="h-[260px] w-full">
                        <StockHealthDonut data={data.stock_health} />
                    </div>
                </motion.div>

                {/* Chart 2: Category Distribution */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Value by Category</h2>
                    </div>
                    <div className="h-[260px] w-full">
                        <CategoryBarChart data={data.category_distribution} />
                    </div>
                </motion.div>

                {/* Chart 3: Top Products */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Top Products by Value</h2>
                    </div>
                    <div className="h-[260px] w-full">
                        <TopProductsBar data={data.top_10_by_value} />
                    </div>
                </motion.div>

                {/* Chart 4: Low Stock */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Critical Low Stock Items</h2>
                    </div>
                    <div className="h-[260px] w-full mt-4">
                        <LowStockBar data={data.low_stock_items} />
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
}
