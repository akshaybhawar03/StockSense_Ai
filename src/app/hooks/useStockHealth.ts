import { useMemo } from 'react';

export interface StockHealthData {
    name: string;
    value: number;
    color: string;
    percentage: string;
}

export function useStockHealth(products: any[]): StockHealthData[] {
    return useMemo(() => {
        if (!products || products.length === 0) return [];

        const counts = {
            Healthy: 0,
            'Low Stock': 0,
            'Out of Stock': 0,
            'Dead Stock': 0,
        };

        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        for (const p of products) {
            // Reconciling with user instructions: quantity/stock, unitPrice/price
            const quantity = p.quantity ?? p.stock ?? 0;
            const threshold = p.reorderThreshold ?? 10;
            const lastSale = p.lastSaleDate ? new Date(p.lastSaleDate) : null;

            if (quantity === 0) {
                counts['Out of Stock']++;
            } else if (quantity <= threshold) {
                counts['Low Stock']++;
            } else if (lastSale && lastSale < ninetyDaysAgo) {
                counts['Dead Stock']++;
            } else {
                counts['Healthy']++;
            }
        }

        const total = products.length;

        return [
            { name: 'Healthy',       value: counts['Healthy'],       color: '#10B981', percentage: ((counts['Healthy'] / total) * 100).toFixed(1) + '%' },
            { name: 'Low Stock',     value: counts['Low Stock'],     color: '#F59E0B', percentage: ((counts['Low Stock'] / total) * 100).toFixed(1) + '%' },
            { name: 'Out of Stock',  value: counts['Out of Stock'],  color: '#EF4444', percentage: ((counts['Out of Stock'] / total) * 100).toFixed(1) + '%' },
            { name: 'Dead Stock',    value: counts['Dead Stock'],    color: '#6B7280', percentage: ((counts['Dead Stock'] / total) * 100).toFixed(1) + '%' },
        ];
    }, [products]);
}
