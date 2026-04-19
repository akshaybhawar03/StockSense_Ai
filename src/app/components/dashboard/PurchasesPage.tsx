import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Plus } from 'lucide-react';
import { getPurchases } from '../../services/sales';
import { PurchaseModal } from './PurchaseModal';
import { Button } from '../ui/button';

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function formatINR(val: number) {
    return '₹' + Number(val).toLocaleString('en-IN', {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
}

function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                    {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <div
                                className="h-4 rounded"
                                style={{
                                    width: `${[80, 120, 140, 50, 80, 80][j]}px`,
                                    background: 'var(--skeleton-bg, #e5e7eb)',
                                    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export function PurchasesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['purchases', 'list'],
        queryFn: ({ signal }) =>
            getPurchases(signal)
                .then(r => {
                    const d = r.data;
                    return Array.isArray(d) ? d : (d.items ?? d.data ?? d.purchases ?? []);
                })
                .catch((err: any) => {
                    if (err?.response?.status === 404) return [];
                    throw err;
                }),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const purchases: any[] = (data ?? []).slice().sort(
        (a: any, b: any) => new Date(b.date ?? b.created_at).getTime() - new Date(a.date ?? a.created_at).getTime()
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Purchase History</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {purchases.length > 0 ? `${purchases.length} transactions` : 'All recorded purchases'}
                        </p>
                    </div>
                </div>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4" /> New Purchase
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">Failed to load purchases</p>
                    <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                        {(error as any)?.response?.data?.detail ?? (error as any)?.message ?? 'Unexpected error'}
                        {(error as any)?.response?.status && ` (HTTP ${(error as any).response.status})`}
                    </p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/80">
                            <tr>
                                {['Date', 'Supplier', 'Product', 'Qty', 'Unit Price', 'Total'].map(h => (
                                    <th key={h} className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {isLoading ? (
                                <TableSkeleton />
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                                            <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-400 dark:text-gray-500 font-medium">No purchases recorded yet</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsModalOpen(true)}
                                            >
                                                Record your first purchase
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((purchase: any, i: number) => {
                                    const unitPrice = purchase.purchase_price ?? purchase.unit_price ?? purchase.price ?? 0;
                                    const qty       = purchase.quantity ?? purchase.qty ?? 0;
                                    const total     = purchase.total_amount ?? purchase.total ?? (unitPrice * qty);

                                    return (
                                        <tr
                                            key={purchase.id ?? i}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                                        >
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(purchase.date ?? purchase.created_at)}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-900 dark:text-white font-medium">
                                                {purchase.supplier_name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {purchase.product_name ?? purchase.product?.name ?? '—'}
                                                </p>
                                                {(purchase.sku ?? purchase.product?.sku) && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                                        {purchase.sku ?? purchase.product?.sku}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 dark:text-gray-300 font-medium">
                                                {Number(qty).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 dark:text-gray-300">
                                                {formatINR(unitPrice)}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 font-semibold text-green-700 dark:text-green-400">
                                                {formatINR(total)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PurchaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['purchases'] });
                }}
            />
        </div>
    );
}
