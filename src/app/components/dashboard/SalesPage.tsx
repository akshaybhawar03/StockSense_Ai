import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Download, Plus } from 'lucide-react';
import { getSales } from '../../services/sales';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';
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
        queryFn: ({ signal }) =>
            getSales(signal)
                .then(r => {
                    const d = r.data;
                    return Array.isArray(d) ? d : (d.items ?? d.data ?? d.sales ?? []);
                })
                .catch((err: any) => {
                    // 404 = endpoint not yet available or no data — show empty state
                    if (err?.response?.status === 404) return [];
                    throw err;
                }),
        staleTime: 60_000,
        retry: 1,
    });

    const sales: any[] = (data ?? []).slice().sort(
        (a: any, b: any) => new Date(b.date ?? b.created_at).getTime() - new Date(a.date ?? a.created_at).getTime()
    );

    function handleRowWhatsAppShare(sale: any) {
        const unitPrice = Number(sale.sale_price ?? sale.unit_price ?? sale.price ?? 0);
        const qty       = Number(sale.quantity ?? sale.qty ?? 0);
        const total     = Number(sale.total_amount ?? sale.total ?? unitPrice * qty);
        const greeting  = sale.customer_name ? `Hello ${sale.customer_name}! 👋` : `Hello! 👋`;
        const downloadUrl: string | undefined = sale.download_url ?? sale.invoice_url;
        const invoiceLink = downloadUrl
            ? `\n📄 Download Invoice: ${downloadUrl}`
            : `\n🔗 View invoices: ${window.location.origin}/dashboard/invoices`;
        const message =
`${greeting}

Thank you for your purchase at SmartGodown! 🙏

Here are your order details:

📦 Product    : ${sale.product_name ?? sale.product?.name ?? 'Product'}
🔢 Quantity   : ${qty} units
💰 Unit Price : ₹${unitPrice.toFixed(2)}
💵 Total Paid : ₹${total.toFixed(2)}
📅 Date       : ${formatDate(sale.date ?? sale.created_at)}
${invoiceLink}

We appreciate your business! 😊
— SmartGodown Team`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    }

    function handleDownload(sale: Record<string, unknown>) {
        const unitPrice = Number(sale.sale_price ?? sale.unit_price ?? sale.price ?? 0);
        const qty       = Number(sale.quantity ?? sale.qty ?? 1);
        const total     = Number(sale.total_amount ?? sale.total ?? unitPrice * qty);
        const productName = String(sale.product_name ?? (sale.product as any)?.name ?? 'Product');
        const invNum = String(
            sale.invoice_number ?? sale.invoice_id ?? sale.id ?? 'INV-0001'
        );

        generateInvoicePDF({
            invoice_number: invNum,
            date:           String(sale.date ?? sale.created_at ?? new Date().toISOString()),
            customer_name:  String(sale.customer_name ?? ''),
            subtotal:       total,
            gst:            0,
            total:          total,
            received:       total,
            balance:        0,
            payment_mode:   String(sale.payment_mode ?? 'Cash'),
            items: [{
                name:       productName,
                quantity:   qty,
                unit_price: unitPrice,
                amount:     total,
            }],
        });
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
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Sales History</h1>
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
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">Failed to load sales</p>
                    <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                        {(error as any)?.response?.data?.detail
                            ?? (error as any)?.response?.data?.message
                            ?? (error as any)?.message
                            ?? 'Unexpected error'}
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
                                {['Date', 'Customer', 'Product', 'Qty', 'Unit Price', 'Total', 'Invoice'].map(h => (
                                    <th key={h} className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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

                                    return (
                                        <tr
                                            key={sale.id ?? i}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                                        >
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(sale.date ?? sale.created_at)}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-900 dark:text-white font-medium">
                                                {sale.customer_name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <p className="text-gray-900 dark:text-white font-medium">{sale.product_name ?? sale.product?.name ?? '—'}</p>
                                                {(sale.sku ?? sale.product?.sku) && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{sale.sku ?? sale.product?.sku}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 dark:text-gray-300 font-medium">
                                                {Number(qty).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 dark:text-gray-300">
                                                {formatINR(unitPrice)}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 font-semibold text-blue-700 dark:text-blue-400">
                                                {formatINR(total)}
                                            </td>
                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleDownload(sale)}
                                                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        <Download className="w-3.5 h-3.5" /> Download
                                                    </button>
                                                    <button
                                                        onClick={() => handleRowWhatsAppShare(sale)}
                                                        className="flex items-center gap-1 text-xs font-medium border rounded-md px-1.5 py-0.5 transition-colors"
                                                        style={{ color: '#25D366', borderColor: '#25D366' }}
                                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                        title="Share on WhatsApp"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                        </svg>
                                                        Share
                                                    </button>
                                                </div>
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
