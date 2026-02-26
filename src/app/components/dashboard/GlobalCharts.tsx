import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function GlobalCharts() {
    const { inventory } = useData();

    const { categoryData, topProducts } = useMemo(() => {
        const categories: Record<string, number> = {};
        const products = [...inventory];

        products.forEach(item => {
            const cat = item.category || 'Uncategorized';
            categories[cat] = (categories[cat] || 0) + item.stock;
        });

        const catData = Object.keys(categories).map(key => ({
            name: key,
            value: categories[key]
        })).sort((a, b) => b.value - a.value).slice(0, 6);

        const topProds = products
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map(p => ({
                name: (p.name || p.sku).substring(0, 15) + '...',
                sales: p.sales,
                revenue: p.sales * p.price
            }));

        return { categoryData: catData, topProducts: topProds };
    }, [inventory]);

    if (inventory.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <PieChartIcon className="w-5 h-5 text-[rgb(var(--accent-primary))]" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory by Category</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                                itemStyle={{ fontWeight: 600 }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-[rgb(var(--accent-primary))]" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top 5 Selling Products</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" interval={0} angle={-15} textAnchor="end" height={50} />
                            <YAxis stroke="#9ca3af" fontSize={11} />
                            <Tooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <Bar dataKey="sales" name="Units Sold" fill="rgb(var(--accent-primary))" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </motion.div>
    );
}
