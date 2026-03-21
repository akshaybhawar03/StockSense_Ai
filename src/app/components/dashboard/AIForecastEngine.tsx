import { useEffect, useState } from 'react';
import { getForecast } from '../../services/forecast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

export function AIForecastEngine() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getForecast()
            .then(r => setData(r.data))
            .catch(err => {
                console.error('Forecast error:', err);
                setError('Forecast not available. Upload a CSV with last_sale_date column to enable forecasting.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className='flex items-center justify-center h-64'>
            <p className='text-gray-400 text-sm'>Loading forecast...</p>
        </div>
    );

    return (
        <div className='p-6 max-w-5xl mx-auto'>
            <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center'>
                    <span className='text-white text-lg'> ✦ </span>
                </div>
                <div>
                    <h1 className='text-2xl font-semibold text-white'>AI Forecasting Engine</h1>
                    <p className='text-sm text-gray-400'>
                        Predictive analytics for demand shaping and dynamic inventory replenishment.
                    </p>
                </div>
            </div>

            {error && (
                <div className='bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6'>
                    <p className='text-amber-400 text-sm'>{error}</p>
                </div>
            )}

            {data && (
                <>
                    {/* 6-Week Demand Forecast Chart */}
                    <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-sm font-medium text-white'>
                                6-Week Aggregate Demand Forecast
                            </h2>
                            <span className='bg-purple-900/50 border border-purple-700/50 text-purple-300 text-xs px-3 py-1 rounded-full'>
                                Neural Net Model Active
                            </span>
                        </div>
                        <ResponsiveContainer width='100%' height={280}>
                            <LineChart data={data.weekly_forecast || []}>
                                <CartesianGrid strokeDasharray='3   3' stroke='#374151' />
                                <XAxis dataKey='week' tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                                <Line type='monotone' dataKey='projected_demand'
                                    stroke='#8b5cf6' strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }}
                                    name='Projected Demand (Units)' />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Next Ordering Window */}
                    {data.next_order_window && (
                        <div className='bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-700/50 rounded-xl p-6'>
                            <h2 className='text-lg font-semibold text-white mb-2'>
                                Next Big Ordering Window
                            </h2>
                            <p className='text-sm text-gray-300 mb-4'>{data.next_order_window.description}</p>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='bg-white/5 rounded-xl p-4'>
                                    <p className='text-xs text-gray-400 mb-1'>Recommended Date</p>
                                    <p className='text-2xl font-bold text-white'>
                                        {data.next_order_window.recommended_date}
                                    </p>
                                </div>
                                <div className='bg-white/5 rounded-xl p-4'>
                                    <p className='text-xs text-gray-400 mb-1'>Estimated Capital Required</p>
                                    <p className='text-xl font-bold text-white'>
                                        {data.next_order_window.estimated_capital}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
