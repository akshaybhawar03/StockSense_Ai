import { useQuery } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInvoices, downloadInvoice } from '../../services/sales';

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
                                    width: `${[90, 80, 120, 80, 60, 80, 70][j]}px`,
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

async function handleDownload(invoiceId: string, invoiceNumber?: string) {
    try {
        const res  = await downloadInvoice(invoiceId);
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

export function InvoicesPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['invoices', 'list'],
        queryFn: ({ signal }) => getInvoices(signal).then(r => {
            const d = r.data;
            return Array.isArray(d) ? d : (d.items ?? d.data ?? d.invoices ?? []);
        }),
        staleTime: 60_000,
    });

    const invoices: any[] = (data ?? []).slice().sort(
        (a: any, b: any) => new Date(b.date ?? b.created_at).getTime() - new Date(a.date ?? a.created_at).getTime()
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice History</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {invoices.length > 0 ? `${invoices.length} invoices` : 'All generated invoices'}
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
                    <p className="text-red-700 dark:text-red-400 text-sm">Failed to load invoices. Check backend connection.</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/80">
                            <tr>
                                {['Invoice #', 'Date', 'Customer', 'Subtotal', 'GST', 'Total', 'Download'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {isLoading ? (
                                <TableSkeleton />
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                                            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-400 dark:text-gray-500 font-medium">No invoices yet</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">Invoices are created automatically when you record a sale.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv: any, i: number) => {
                                    const subtotal = inv.subtotal ?? inv.sub_total ?? 0;
                                    const gst      = inv.gst ?? inv.tax ?? inv.tax_amount ?? 0;
                                    const total    = inv.total ?? inv.total_amount ?? (subtotal + gst);

                                    return (
                                        <tr
                                            key={inv.id ?? i}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300 font-medium">
                                                {inv.invoice_number ?? inv.number ?? `#${String(i + 1).padStart(4, '0')}`}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(inv.date ?? inv.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                                {inv.customer_name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                {formatINR(subtotal)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {gst > 0 ? formatINR(gst) : <span className="text-gray-400 dark:text-gray-500">—</span>}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-purple-700 dark:text-purple-400">
                                                {formatINR(total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDownload(inv.id, inv.invoice_number ?? inv.number)}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Download
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
