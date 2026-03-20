import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
    healthy: '#22c55e',
    low: '#f59e0b',
    out_of_stock: '#ef4444',
    dead_stock: '#6b7280'
};

const LABELS: Record<string, string> = {
    healthy: 'Healthy',
    low: 'Low Stock',
    out_of_stock: 'Out of Stock',
    dead_stock: 'Dead Stock'
};

export function StockHealthDonut({ data }: { data: Record<string, number> | undefined }) {
    if (!data) return <div className="h-full flex items-center justify-center text-gray-400">No data</div>;

    const chartData = Object.entries(data)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
            name: LABELS[k] || k,
            value: v,
            key: k
        }));

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    dataKey="value" 
                    paddingAngle={3}
                >
                    {chartData.map((entry) => (
                        <Cell key={entry.key} fill={COLORS[entry.key] || '#9ca3af'} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(v: number, n: string) => [v.toLocaleString('en-IN') + ' items', n]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
        </ResponsiveContainer>
    );
}
