import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Invoice } from '../../services/barcode';

interface Props {
    invoice: Invoice;
    onClose: () => void;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function formatINR(val: number) {
    return '₹' + Number(val).toFixed(2);
}

export function InvoiceModal({ invoice, onClose }: Props) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handlePrint = () => window.print();

    const warehouseName = user?.name ?? user?.email ?? 'SmartGodown';

    return (
        <>
            {/*
             * Print stylesheet — only activates during window.print().
             * Hides everything except .invoice-print-area.
             */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .invoice-print-area,
                    .invoice-print-area * { visibility: visible !important; }
                    .invoice-print-area {
                        position: fixed !important;
                        inset: 0 !important;
                        padding: 40px !important;
                        background: white !important;
                        color: black !important;
                        z-index: 99999 !important;
                        overflow: visible !important;
                        max-height: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                    }
                    .no-print { display: none !important; }
                    .print-header { display: block !important; }
                }
            `}</style>

            {/* Backdrop — click-through disabled intentionally */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.35 }}
                    className="invoice-print-area w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                >
                    {/* ── Print-only company header (hidden on screen) ── */}
                    <div className="print-header hidden mb-6">
                        <p className="text-2xl font-bold text-gray-900">{warehouseName}</p>
                        <p className="text-sm text-gray-500">GST Tax Invoice</p>
                        <hr className="mt-3 border-gray-300" />
                    </div>

                    {/* ── Success header ── */}
                    <div className="no-print px-6 pt-6 pb-4 text-center border-b border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                            <CheckCircle className="w-9 h-9 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                            Sale Successful!
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">
                            Invoice #{invoice.invoice_number}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(invoice.created_at)}
                        </p>
                    </div>

                    {/* ── Print-only invoice meta ── */}
                    <div className="print-header hidden px-0 pb-4">
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Invoice No: <strong>{invoice.invoice_number}</strong></span>
                            <span>Date: <strong>{formatDate(invoice.created_at)}</strong></span>
                        </div>
                    </div>

                    {/* ── Items table + bill summary (scrollable) ── */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="px-4 py-3 text-left font-medium">Product</th>
                                        <th className="px-4 py-3 text-left font-medium">SKU</th>
                                        <th className="px-4 py-3 text-center font-medium">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {invoice.items.map((item, i) => (
                                        <tr
                                            key={i}
                                            className={
                                                i % 2 === 0
                                                    ? 'bg-white dark:bg-gray-900'
                                                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                                            }
                                        >
                                            <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                                                {item.product_name}
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                                {item.sku}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-gray-700 dark:text-gray-300">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {formatINR(item.unit_price)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatINR(item.line_total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Bill summary */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>{formatINR(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>GST ({invoice.gst_rate}%)</span>
                                <span>{formatINR(invoice.gst_amount)}</span>
                            </div>
                            <div className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
                            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                                <span>Grand Total</span>
                                <span className="text-green-600 dark:text-green-400">
                                    {formatINR(invoice.total_amount)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                                {invoice.item_count} item(s) sold
                            </p>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="no-print px-6 py-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                Print Invoice
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[rgb(var(--accent-primary))] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Done
                            </button>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={() => navigate('/dashboard/invoices')}
                                className="text-sm text-[rgb(var(--accent-primary))] hover:underline"
                            >
                                View in Invoices →
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
