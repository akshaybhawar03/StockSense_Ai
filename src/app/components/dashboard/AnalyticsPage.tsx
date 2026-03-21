import { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/analytics';
import toast from 'react-hot-toast';

import StockHealthDonut from '../charts/StockHealthDonut';
import CategoryBarChart from '../charts/CategoryBarChart';
import TopProductsBar from '../charts/TopProductsBar';
import LowStockBar from '../charts/LowStockBar';

export function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAnalytics()
            .then(r => setData(r.data))
            .catch(err => {
                console.error('Analytics error:', err);
                setError('Failed to load analytics. Check backend connection.');
                toast.error('Failed to load analytics');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className='p-6 text-gray-400 text-sm'>Loading analytics...</div>;
    if (error) return (
        <div className='p-6'>
            <div className='bg-red-900/20 border border-red-700/50 rounded-xl p-4'>
                <p className='text-red-400 text-sm'>{error}</p>
            </div>
        </div>
    );

    return (
        <div className='p-6 max-w-7xl mx-auto'>
            <h1 className='text-2xl font-semibold text-white mb-6'>Analytics</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Stock health</h2>
                    <StockHealthDonut data={data.stock_health} />
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Value by category</h2>
                    <CategoryBarChart data={data.category_distribution} />
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Top 10 by value</h2>
                    <TopProductsBar data={data.top_10_by_value} />
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Low stock levels</h2>
                    <LowStockBar data={data.low_stock_items} />
                </div>
            </div>
        </div>
    );
}
