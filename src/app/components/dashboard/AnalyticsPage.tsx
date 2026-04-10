import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getInventory } from '../../services/inventory';
import toast from 'react-hot-toast';

import StockHealthDonut from '../charts/StockHealthDonut';
import CategoryBarChart from '../charts/CategoryBarChart';
import TopProductsBar from '../charts/TopProductsBar';
import LowStockBar from '../charts/LowStockBar';
import { AnalyticsSkeleton } from '../skeletons/AnalyticsSkeleton';

import { useStockHealth } from '../../hooks/useStockHealth';

export function AnalyticsPage() {
    const { data: responseData, isLoading, error } = useQuery({
        queryKey: ['products', 'all'],
        queryFn: ({ signal }) => getInventory({ limit: 1000 }, signal).then(r => r.data),
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
            scoreColor = 'text-orange-500';
        }

        return {
            totalValue,
            deadStockValue,
            stockHealthScore: Math.round(stockHealthScore),
            scoreColor,
            attentionItems
        };
    }, [products]);

    if (isLoading) return <AnalyticsSkeleton />;

    if (error) return (
        <div className='p-6'>
            <div className='bg-red-900/20 border border-red-700/50 rounded-xl p-4'>
                <p className='text-red-400 text-sm'>Failed to load analytics. Check backend connection.</p>
            </div>
        </div>
    );

    return (
        <div className='p-6 max-w-7xl mx-auto'>
            <h1 className='text-2xl font-semibold text-white mb-6'>Analytics</h1>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-400 mb-1'>Total Inventory Value</h3>
                    <p className='text-xl font-bold text-white'>
                        ₹{summaryCards.totalValue.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-400 mb-1'>Capital in Dead Stock</h3>
                    <p className='text-xl font-bold text-white'>
                        ₹{summaryCards.deadStockValue.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-400 mb-1'>Stock Health Score</h3>
                    <p className={`text-xl font-bold ${summaryCards.scoreColor}`}>
                        {summaryCards.stockHealthScore}%
                    </p>
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-4'>
                    <h3 className='text-xs font-medium text-gray-400 mb-1'>Items Needing Attention</h3>
                    <p className='text-xl font-bold text-orange-400'>
                        {summaryCards.attentionItems} items
                    </p>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Stock health</h2>
                    <StockHealthDonut data={stockHealthData} />
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Value by category</h2>
                    <CategoryBarChart data={categoryData} />
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Top 10 by value</h2>
                    <TopProductsBar data={top10Data} />
                </div>
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h2 className='text-sm font-medium text-gray-300 mb-4'>Low stock levels</h2>
                    <LowStockBar data={lowStockData} />
                </div>
            </div>
        </div>
    );
}
