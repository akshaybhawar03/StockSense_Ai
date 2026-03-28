import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../../services/analytics';
import toast from 'react-hot-toast';

import StockHealthDonut from '../charts/StockHealthDonut';
import CategoryBarChart from '../charts/CategoryBarChart';
import TopProductsBar from '../charts/TopProductsBar';
import LowStockBar from '../charts/LowStockBar';
import { AnalyticsSkeleton } from '../skeletons/AnalyticsSkeleton';

export function AnalyticsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: ({ signal }) => getAnalytics(signal).then(r => r.data),
        staleTime: 60_000,
    });

    if (isLoading) return <AnalyticsSkeleton />;

    if (error) return (
        <div className='p-6'>
            <div className='bg-red-900/20 border border-red-700/50 rounded-xl p-4'>
                <p className='text-red-400 text-sm'>Failed to load analytics. Check backend connection.</p>
            </div>
        </div>
    );

    if (!data) return <AnalyticsSkeleton />;

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
