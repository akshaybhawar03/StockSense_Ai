import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export function LowStockBar({ data }: { data: { name: string; quantity: number; reorder_level: number }[] | undefined }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No data</div>;

    const sorted = [...data].sort((a, b) => a.quantity - b.quantity).slice(0, 8);

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sorted} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                    dataKey="name" 
                    tickFormatter={n => n.length > 8 ? n.slice(0, 8) + '..' : n}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                />
                <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                    formatter={(v: number, name: string, props: any) => [
                        v + ` (Reorder: ${props.payload.reorder_level})`, 'Quantity'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="quantity" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {sorted.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.quantity <= entry.reorder_level / 2 ? '#ef4444' : '#f59e0b'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
