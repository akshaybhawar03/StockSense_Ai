import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSales, downloadInvoice } from '../../services/sales';
import { SaleModal } from './SaleModal';
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
                    {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <div
                                className="h-4 rounded"
                                style={{
                                    width: `${[80, 110, 130, 50, 80, 80, 70][j]}px`,
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

export function SalesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['sales', 'list'],
        queryFn: ({ signal }) => getSales(signal).then(r => {
            const d = r.data;
            return Array.isArray(d) ? d : (d.items ?? d.data ?? d.sales ?? []);
        }),
        staleTime: 60_000,
    });

    const sales: any[] = (data ?? []).slice().sort(
        (a: any, b: any) => new Date(b.date ?? b.created_at).getTime() - new Date(a.date ?? a.created_at).getTime()
    );

    async function handleDownload(invoiceId: string, invoiceNumber?: string) {
        try {
            const res = await downloadInvoice(invoiceId);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url  = window.URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `invoice_${invoiceNumber ?? invoiceId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Could not download invoice');
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales History</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {sales.length > 0 ? `${sales.length} transactions` : 'All recorded sales'}
                        </p>
                    </div>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4" /> New Sale
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
                    <p className="text-red-700 dark:text-red-400 text-sm">Failed to load sales. Check backend connection.</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/80">
                            <tr>
                                {['Date', 'Customer', 'Product', 'Qty', 'Unit Price', 'Total', 'Invoice'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {isLoading ? (
                                <TableSkeleton />
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                                            <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-400 dark:text-gray-500 font-medium">No sales recorded yet</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsModalOpen(true)}
                                            >
                                                Record your first sale
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale: any, i: number) => {
                                    const unitPrice = sale.sale_price ?? sale.unit_price ?? sale.price ?? 0;
                                    const qty       = sale.quantity ?? sale.qty ?? 0;
                                    const total     = sale.total_amount ?? sale.total ?? (unitPrice * qty);
                                    const invoiceId = sale.invoice_id ?? sale.invoice?.id;

                                    return (
                                        <tr
                                            key={sale.id ?? i}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(sale.date ?? sale.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                                {sale.customer_name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-900 dark:text-white font-medium">{sale.product_name ?? sale.product?.name ?? '—'}</p>
                                                {(sale.sku ?? sale.product?.sku) && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{sale.sku ?? sale.product?.sku}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                                                {Number(qty).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                {formatINR(unitPrice)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-blue-700 dark:text-blue-400">
                                                {formatINR(total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {invoiceId ? (
                                                    <button
                                                        onClick={() => handleDownload(invoiceId, sale.invoice_number)}
                                                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        <Download className="w-3.5 h-3.5" /> Download
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SaleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['sales'] });
                }}
            />
        </div>
    );
}
