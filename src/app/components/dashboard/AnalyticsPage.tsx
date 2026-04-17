import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getInventory } from '../../services/inventory';
import { getLocationComparison } from '../../services/analytics';
import { useLocation as useLocationCtx } from '../../contexts/LocationContext';
import { LocationSwitcher } from '../locations/LocationSwitcher';

import StockHealthDonut from '../charts/StockHealthDonut';
import CategoryBarChart from '../charts/CategoryBarChart';
import TopProductsBar from '../charts/TopProductsBar';
import LowStockBar from '../charts/LowStockBar';
import { AnalyticsSkeleton } from '../skeletons/AnalyticsSkeleton';
import { useStockHealth } from '../../hooks/useStockHealth';

// Location Comparison uses the analytics service
function LocationComparisonSection({ fromDate, toDate }: { fromDate: string; toDate: string }) {
    const { data: compRes, isLoading } = useQuery({
        queryKey: ['analytics', 'location-comparison', fromDate, toDate],
        queryFn: () => getLocationComparison({ from_date: fromDate || undefined, to_date: toDate || undefined }),
        staleTime: 60_000,
    });

    const compData: any[] = Array.isArray(compRes?.data)
        ? compRes.data
        : (compRes?.data?.locations ?? compRes?.data?.data ?? []);

    if (isLoading) return <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />;
    if (!compData.length) return null;

    const chartData = compData.map((l: any) => ({
        name: l.name ?? l.location_name ?? '?',
        Sales: l.total_sales ?? 0,
        Purchases: l.total_purchases ?? 0,
        'Inventory Value': l.inventory_value ?? l.total_stock_value ?? 0,
    }));

    return (
        <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5'>
            <h2 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>Location Comparison</h2>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.3)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Sales" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="Purchases" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="Inventory Value" fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function AnalyticsPage() {
    const { selectedLocationId } = useLocationCtx();
    const [fromDate] = useState('');
    const [toDate]   = useState('');

    const { data: responseData, isLoading, error } = useQuery({
        queryKey: ['products', 'all', selectedLocationId],
        queryFn: ({ signal }) => getInventory({ limit: 1000, location_id: selectedLocationId || undefined }, signal).then(r => r.data),
        staleTime: 60_000,
    });

    const products = Array.isArray(responseData) ? responseData : (responseData?.data ?? []);

    const stockHealthData = useStockHealth(products);

    const categoryData = useMemo(() => {
        if (!products || products.length === 0) return [];
        const cats: Record<string, number> = {};
        products.forEach((p: any) => {
            const cat = p.category || 'Uncategorized';
            cats[cat] = (cats[cat] || 0) + ((p.quantity ?? p.stock ?? 0) * (p.unitPrice ?? p.price ?? 0));
        });
        return Object.entries(cats).map(([category, value]) => ({ category, value }));
    }, [products]);

    const top10Data = useMemo(() => {
        if (!products || products.length === 0) return [];
        return [...products]
            .map((p: any) => ({ 
                name: p.name, 
                totalValue: (p.quantity ?? p.stock ?? 0) * (p.unitPrice ?? p.price ?? 0), 
                sku: p.sku 
            }))
            .sort((a, b) => b.totalValue - a.totalValue)
            .slice(0, 10);
    }, [products]);

    const lowStockData = useMemo(() => {
        if (!products || products.length === 0) return [];
        return [...products]
            .filter((p: any) => {
                const q = p.quantity ?? p.stock ?? 0;
                const t = p.reorderThreshold ?? 10;
                return q > 0 && q <= t * 2;
            })
            .map((p: any) => {
                const q = p.quantity ?? p.stock ?? 0;
                const t = p.reorderThreshold ?? 10;
                return {
                    name: p.name,
                    current: q,
                    threshold: t,
                    percentage: Math.round((q / t) * 100)
                };
            })
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 10);
    }, [products]);

    const summaryCards = useMemo(() => {
        let totalValue = 0;
        let deadStockValue = 0;
        let healthyCount = 0;
        let attentionItems = 0;

        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        products.forEach((p: any) => {
            const q = p.quantity ?? p.stock ?? 0;
            const price = p.unitPrice ?? p.price ?? 0;
            const t = p.reorderThreshold ?? 10;
            const lastSale = p.lastSaleDate ? new Date(p.lastSaleDate) : null;

            totalValue += q * price;

            if (q === 0) {
                attentionItems++;
            } else if (q <= t) {
                attentionItems++;
            } else if (lastSale && lastSale < ninetyDaysAgo) {
                deadStockValue += q * price;
            } else {
                healthyCount++;
            }
        });

        const stockHealthScore = products.length > 0 ? (healthyCount / products.length) * 100 : 0;
        
        let scoreColor = 'text-green-500';
        if (stockHealthScore < 40) {
            scoreColor = 'text-red-500';
        } else if (stockHealthScore <= 70) {
            scoreColor = 'text-green-500';
        }

        return {
            totalValue,
            deadStockValue,
            stockHealthScore: Math.round(stockHealthScore),
            scoreColor,
            attentionItems
        };
    }, [products]);

    if (error) return (
        <div>
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4'>
                <p className='text-red-700 dark:text-red-400 text-sm'>Failed to load analytics. Check backend connection.</p>
            </div>
        </div>
    );

    return (
        <div className='max-w-7xl mx-auto'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-6'>
                <h1 className='text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white'>Analytics</h1>
                <LocationSwitcher />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>Total Inventory Value</h3>
                    <p className='text-xl font-bold text-gray-900 dark:text-white'>
                        ₹{summaryCards.totalValue.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>Capital in Dead Stock</h3>
                    <p className='text-xl font-bold text-gray-900 dark:text-white'>
                        ₹{summaryCards.deadStockValue.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>Stock Health Score</h3>
                    <p className={`text-xl font-bold ${summaryCards.scoreColor}`}>
                        {summaryCards.stockHealthScore}%
                    </p>
                </div>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>Items Needing Attention</h3>
                    <p className='text-xl font-bold text-green-500'>
                        {summaryCards.attentionItems} items
                    </p>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>Stock health</h2>
                    <StockHealthDonut data={stockHealthData} />
                </div>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>Value by category</h2>
                    <CategoryBarChart data={categoryData} />
                </div>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>Top 10 by value</h2>
                    <TopProductsBar data={top10Data} />
                </div>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>Low stock levels</h2>
                    <LowStockBar data={lowStockData} />
                </div>
            </div>

            {/* Location Comparison — shown when All Locations selected */}
            {!selectedLocationId && (
                <div className='mt-6'>
                    <LocationComparisonSection fromDate={fromDate} toDate={toDate} />
                </div>
            )}
        </div>
    );
}
