import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function TopProductsBar({ data }: { data: { name: string; value: number }[] | undefined }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No data</div>;

    const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                <XAxis 
                    type="number" 
                    tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    tickFormatter={n => n.length > 15 ? n.slice(0, 15) + '...' : n}
                    tick={{ fontSize: 11, fill: '#374151' }} 
                    width={100} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                    formatter={(v: number) => ['₹' + v.toLocaleString('en-IN'), 'Value']} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar 
                    dataKey="value" 
                    fill="url(#colorTopProd)" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20}
                />
                <defs>
                    <linearGradient id="colorTopProd" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    );
}
