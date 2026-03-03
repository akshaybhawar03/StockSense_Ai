import React from 'react';
import { usePrediction } from '../../lib/queries';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';

export function PredictionChart({ productId }: { productId?: number }) {
    // Pass 1 if no product selected to show some mock data
    const { data, isLoading } = usePrediction(productId || 1);

    if (isLoading) return <div className="h-[300px] w-full flex items-center justify-center animate-pulse">Loading AI Predictions...</div>;

    return (
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border border-gray-100 dark:border-gray-800 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Demand Forecast AI</h3>
                    <p className="text-sm text-gray-500">6-month volume prediction</p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#111827', fontWeight: 500 }}
                            labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual Sales" />
                        <Area type="monotone" dataKey="predictedDemand" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" name="AI Prediction" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
