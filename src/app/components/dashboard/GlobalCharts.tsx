import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

export function GlobalCharts({ stats }: { stats: any }) {
    if (!stats) return null;

    const RADIAN = Math.PI / 180;
    const COLORS = [
        '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
        '#ec4899','#14b8a6','#f97316','#06b6d4','#84cc16',
        '#a855f7','#e11d48','#0ea5e9','#22d3ee'
    ];

    const renderCustomLabel = ({
        cx, cy, midAngle, innerRadius, outerRadius, percent, name
    }: any) => {
        if (percent < 0.05) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor="middle"
                dominantBaseline="central" fontSize={11} fontWeight={500}>
                {(percent * 100).toFixed(0)}%
            </text>
        );
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div style={{
                    background:'#1e293b', border:'1px solid #334155',
                    borderRadius:8, padding:'10px 14px'
                }}>
                    <p style={{color:'#94a3b8',fontSize:12,margin:'0 0 4px'}}>
                        {d.category || d.name || 'Category'}
                    </p>
                    <p style={{color:'white',fontSize:14,fontWeight:600,margin:'0 0 2px'}}>
                        ₹{Number(d.value).toLocaleString('en-IN')}
                    </p>
                    {d.count && (
                        <p style={{color:'#64748b',fontSize:11,margin:0}}>
                            {d.count} products
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    const categoryData = stats?.category_breakdown || [];

    const top5Data = stats?.top_5_selling || [];
    const BAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];

    const BarTooltip = ({ active, payload }: any) => {
        if (active && payload?.length) {
            return (
                <div style={{
                    background:'#1e293b', border:'1px solid #334155',
                    borderRadius:8, padding:'10px 14px'
                }}>
                    <p style={{color:'#94a3b8',fontSize:11,margin:'0 0 4px'}}>
                        {payload[0].payload.name}
                    </p>
                    <p style={{color:'white',fontSize:13,fontWeight:600,margin:0}}>
                        {payload[0].value} units
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl relative">
                <div className="flex items-center gap-2 mb-6">
                    <PieChartIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory by Category</h3>
                </div>
                {/* Center total value for donut (using absolute positioning instead of complex SVG logic if preferred, or rely on Custom SVG above) */}
                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
                   <p className="text-[11px] text-slate-400 m-0">Total Value</p>
                   <p className="text-sm font-bold text-white m-0">
                     ₹{Number((categoryData.reduce((s:any, c:any) => s + c.value, 0))/100000).toFixed(1)}L
                   </p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={115}
                            paddingAngle={2}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomLabel}
                        >
                            {categoryData.map((entry: any, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => (
                                <span style={{color:'#94a3b8', fontSize:11}}>{value}</span>
                            )}
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top 5 Selling Products</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                        data={top5Data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            angle={-30}
                            textAnchor="end"
                            tickLine={false}
                            axisLine={{ stroke: '#1e293b' }}
                            tickFormatter={(v) => v?.length > 12 ? v.slice(0,12)+'...' : v}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                            {top5Data.map((entry: any, index: number) => (
                                <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </motion.div>
    );
}
