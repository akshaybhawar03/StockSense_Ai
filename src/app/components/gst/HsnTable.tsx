import { HsnSummary } from '../../services/gst';

const formatINR = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v ?? 0);

interface Props {
    data: HsnSummary[];
}

export function HsnTable({ data }: Props) {
    const isEmpty = data.length === 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">HSN-wise Summary</h3>
                {!isEmpty && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {data.length} HSN code{data.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {isEmpty ? (
                <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    No HSN data for this period
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3 text-left whitespace-nowrap">HSN Code</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Description</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Quantity</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Taxable Value</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">CGST</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">SGST</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">IGST</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {data.map((row, i) => (
                                <tr key={row.hsn_code ?? i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                    <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">{row.hsn_code || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">{row.description || '—'}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap">{Number(row.quantity ?? 0).toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatINR(row.taxable_value)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(row.cgst)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(row.sgst)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatINR(row.igst)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
