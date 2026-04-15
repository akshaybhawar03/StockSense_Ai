import { useState, useMemo } from 'react';
import { useForecast } from '../../hooks/useForecast';
import {
    AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ForecastSkeleton } from '../skeletons/ForecastSkeleton';

// Map time labels to weeksCount
const timeRanges = {
  '6 Weeks': 6,
  '12 Weeks': 12,
  '6 Months': 26,
};

export function AIForecastEngine() {
    const [timeRange, setTimeRange] = useState<'6 Weeks' | '12 Weeks' | '6 Months'>('6 Weeks');
    const [viewMode, setViewMode] = useState<'Aggregate' | 'Per Category'>('Aggregate');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

    const weeksCount = timeRanges[timeRange];
    const { 
        state, data, reorderItems, isLoading, 
        categories, hasActualData, nextOrderWindow 
    } = useForecast(weeksCount);

    const forecastData = useMemo(() => {
        return data; 
    }, [data]);

    // Show skeleton only if we don't even have baseline data yet
    

    const getBadgeStyle = () => {
        if (state === 'STATE_A') return 'bg-green-50 border-green-200 text-green-300';
        if (state === 'STATE_B') return 'bg-green-50 border-green-200 text-green-300';
        return 'bg-green-50 border-green-200 text-green-300';
    };

    const getBadgeText = () => {
        if (state === 'STATE_A') return 'AI Baseline';
        if (state === 'STATE_B') return 'Hybrid Model';
        return 'Neural Net Active';
    };

    return (
        <div className='max-w-6xl mx-auto'>
            <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 shrink-0 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/20'>
                    <span className='text-gray-900 text-lg'> ✨ </span>
                </div>
                <div className='min-w-0'>
                    <h1 className='text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white'>AI Forecasting Engine</h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Predictive analytics for demand shaping and dynamic inventory replenishment.
                    </p>
                </div>
            </div>

            {state === 'STATE_A' && (
                <div className='bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3'>
                    <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                    <p className='text-green-800 text-sm'>
                        Forecast based on inventory analysis — add sales data for personalised predictions.
                    </p>
                </div>
            )}
            
            {state === 'STATE_B' && (
                <div className='bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3'>
                    <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                    <p className='text-green-800 text-sm'>
                        Limited sales history — forecast accuracy improves with more data.
                    </p>
                </div>
            )}

            {/* Filters */}
            <div className='flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-6 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>Time Range:</span>
                    <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600'>
                        {['6 Weeks', '12 Weeks', '6 Months'].map(r => (
                            <button key={r} onClick={() => setTimeRange(r as any)}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeRange === r ? 'bg-green-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>View:</span>
                    <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600'>
                        {['Aggregate', 'Per Category'].map(v => (
                            <button key={v} onClick={() => setViewMode(v as any)}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === v ? 'bg-green-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='flex items-center gap-2 sm:ml-auto'>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>Category:</span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className='bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-green-500'
                    >
                        <option>All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Chart Area */}
            <div className='bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6 shadow-sm'>
                <div className='flex flex-wrap items-center justify-between gap-2 mb-6'>
                    <h2 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {timeRange} {viewMode} Demand Forecast
                    </h2>
                    <div className='flex items-center gap-2'>
                        <span className={`text-xs px-3 py-1 rounded-full border ${getBadgeStyle()}`}>
                            {getBadgeText()}
                        </span>
                    </div>
                </div>

                <ResponsiveContainer width='100%' height={320}>
                    <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id='colorProjected' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.3}/>
                                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0}/>
                            </linearGradient>
                            {/* per category colors if needed */}
                            {categories.map((cat, i) => {
                                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
                                const color = colors[i % colors.length];
                                return (
                                    <linearGradient key={cat} id={`color-${i}`} x1='0' y1='0' x2='0' y2='1'>
                                        <stop offset='5%' stopColor={color} stopOpacity={0.3}/>
                                        <stop offset='95%' stopColor={color} stopOpacity={0}/>
                                    </linearGradient>
                                )
                            })}
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' vertical={false} />
                        <XAxis dataKey='week' tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dx={-10} />
                        <Tooltip
                            formatter={(value: any, name: any) => [value + ' units', name === 'projected' ? 'Projected' : name === 'actual' ? 'Actual Sales' : name]}
                            contentStyle={{ background: '#1e2433', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6' }}
                            itemStyle={{ fontSize: 13 }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af', paddingTop: '20px' }} />

                        {viewMode === 'Aggregate' || selectedCategory !== 'All Categories' ? (
                            <>
                                <Area 
                                    type='monotone' 
                                    dataKey={selectedCategory !== 'All Categories' ? selectedCategory : 'projected'} 
                                    stroke='#8b5cf6' 
                                    strokeWidth={3}
                                    fill='url(#colorProjected)' 
                                    name='Projected'
                                />
                                {hasActualData && selectedCategory === 'All Categories' && (
                                    <Line 
                                        type='monotone' 
                                        dataKey='actual' 
                                        stroke='#10b981' 
                                        strokeWidth={3} 
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} 
                                        activeDot={{ r: 6 }}
                                        name='Actual Sales'
                                    />
                                )}
                            </>
                        ) : (
                            categories.map((cat, i) => {
                                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
                                const color = colors[i % colors.length];
                                return (
                                    <Area 
                                        key={cat}
                                        type='monotone' 
                                        dataKey={cat} 
                                        stroke={color} 
                                        strokeWidth={2}
                                        fill={`url(#color-${i})`} 
                                        name={cat}
                                    />
                                );
                            })
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                {/* Reorder Table */}
                <div className='lg:col-span-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden'>
                    <h2 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-4'>Top Items to Reorder</h2>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-600 dark:text-gray-300 capitalize'>
                                    <th className='pb-3 pr-4'>Product</th>
                                    <th className='pb-3 px-4'>Stock</th>
                                    <th className='pb-3 px-4'>Weekly Demand</th>
                                    <th className='pb-3 px-4'>Days to Stockout</th>
                                    <th className='pb-3 px-4'>Suggested Qty</th>
                                </tr>
                            </thead>
                            <tbody className='text-sm'>
                                {reorderItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400 italic">No products available</td>
                                    </tr>
                                ) : (
                                    reorderItems.map((item) => {
                                        const isCritical = item.daysUntilStockout < 7;
                                        const isWarning = item.daysUntilStockout >= 7 && item.daysUntilStockout < 14;
                                        return (
                                            <tr key={item.id} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors
                                                ${isCritical ? 'bg-red-50 dark:bg-red-900/10' : ''} ${isWarning ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                                                <td className='py-3 pr-4 flex flex-col justify-center'>
                                                    <div className='font-medium text-gray-900 dark:text-gray-100'>{item.name}</div>
                                                    <div className='text-xs text-gray-500 dark:text-gray-400'>{item.sku}</div>
                                                </td>
                                                <td className='py-3 px-4 text-gray-600 dark:text-gray-300'>{item.currentStock}</td>
                                                <td className='py-3 px-4 text-gray-600 dark:text-gray-300'>{item.weeklyDemand}</td>
                                                <td className='py-3 px-4'>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap
                                                        ${isCritical ? 'bg-red-100 text-red-600 border-red-200' : 
                                                          isWarning ? 'bg-green-100 text-green-600 border-green-200' : 
                                                          'bg-white text-gray-500 border-gray-200'}`}>
                                                        {item.daysUntilStockout} days
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4 text-green-400 font-medium whitespace-nowrap'>+{item.recommendedOrderQty}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Next Ordering Window Info */}
                <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-4 sm:p-6 shadow-sm h-full'>
                    <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                        Next Big Ordering Window
                    </h2>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>{nextOrderWindow.description}</p>
                    <div className='space-y-4'>
                        <div className='bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700'>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>Recommended Date</p>
                            <p className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words'>
                                {nextOrderWindow.recommended_date}
                            </p>
                        </div>
                        <div className='bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700'>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>Estimated Capital Required</p>
                            <p className='text-xl font-bold text-green-500 dark:text-green-400 break-words'>
                                {nextOrderWindow.estimated_capital}
                            </p>
                        </div>
                        <button className='w-full py-3 mt-4 bg-green-600 hover:bg-green-500 text-gray-900 text-sm font-medium rounded-xl transition-colors shadow-lg shadow-green-600/20'>
                            Prepare Purchase Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

