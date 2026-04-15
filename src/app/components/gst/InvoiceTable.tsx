import { B2BInvoice, B2CInvoice } from '../../services/gst';

const formatINR = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v ?? 0);

const formatDate = (d: string) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface B2BProps {
    type: 'b2b';
    title: string;
    data: B2BInvoice[];
}

interface B2CProps {
    type: 'b2c';
    title: string;
    data: B2CInvoice[];
}

type Props = B2BProps | B2CProps;

export function InvoiceTable(props: Props) {
    const { type, title, data } = props;
    const isEmpty = data.length === 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                {!isEmpty && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                        {data.length} invoice{data.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {isEmpty ? (
                <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    No {type === 'b2b' ? 'B2B' : 'B2C'} invoices for this period
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3 text-left whitespace-nowrap">Invoice No.</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Customer</th>
                                {type === 'b2b' && <th className="px-4 py-3 text-left whitespace-nowrap">GSTIN</th>}
                                <th className="px-4 py-3 text-right whitespace-nowrap">Taxable Value</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">CGST</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">SGST</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">IGST</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {type === 'b2b'
                                ? (data as B2BInvoice[]).map((inv, i) => (
                                    <tr key={inv.invoice_number ?? i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{inv.invoice_number}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(inv.date)}</td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-[140px] truncate">{inv.customer_name || '—'}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{inv.gstin || '—'}</td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatINR(inv.taxable_value)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(inv.cgst)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(inv.sgst)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(inv.igst)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{formatINR(inv.total)}</td>
                                    </tr>
                                ))
                                : (data as B2CInvoice[]).map((inv, i) => (
                                    <tr key={inv.invoice_number ?? i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{inv.invoice_number}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(inv.date)}</td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-[160px] truncate">{inv.customer_name || '—'}</td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatINR(inv.taxable_value)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(inv.cgst)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(inv.sgst)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(inv.igst)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{formatINR(inv.total)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
