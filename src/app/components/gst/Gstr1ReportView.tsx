import { useRef, useCallback } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Gstr1Data, B2BInvoice, B2CInvoice } from '../../services/gst';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtN = (v: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);

const fmtDate = (d: string) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Shared cell styles ────────────────────────────────────────────────────────
const TH  = 'border border-gray-400 dark:border-gray-500 px-2 py-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 text-center align-middle';
const TD  = 'border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 align-top';
const TDR = 'border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-[11px] text-right text-gray-700 dark:text-gray-300 font-mono tabular-nums align-top';
const TDN = 'border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-[11px] text-right font-bold text-gray-900 dark:text-white font-mono tabular-nums align-top bg-gray-50 dark:bg-gray-800';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    data: Gstr1Data;
    startDate: string;
    endDate: string;
    onPrint?: (fn: () => void) => void;   // lets parent call our print fn
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Gstr1ReportView({ data, startDate, endDate, onPrint }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    const b2b: B2BInvoice[] = data.b2b_invoices ?? [];
    const b2c: B2CInvoice[] = data.b2c_invoices ?? [];

    // Combine all sales (B2B has GSTIN, B2C shows —)
    const allSales = [
        ...b2b.map(i => ({ ...i, gstin: i.gstin || '—', isB2B: true })),
        ...b2c.map(i => ({ ...i, gstin: '—', isB2B: false })),
    ];

    const periodLabel = (() => {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${startDate} to ${endDate}`;
        const sm = s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const em = e.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        return sm === em ? sm : `${sm} – ${em}`;
    })();

    const companyName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'My Company';

    // ── Print ──────────────────────────────────────────────────────────────────
    const handlePrint = useCallback(() => {
        const body = printRef.current?.innerHTML ?? '';
        const win = window.open('', '_blank', 'width=1000,height=720');
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head><title>GSTR-1 Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:24px 32px;}
  h1{font-size:18px;font-weight:700;text-align:center;text-decoration:underline;margin-bottom:18px;}
  .section-title{font-size:13px;font-weight:700;text-align:center;text-decoration:underline;margin:20px 0 8px;}
  table{width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:4px;}
  th{border:1px solid #666;padding:5px 6px;font-weight:700;text-align:center;background:#e5e7eb;vertical-align:middle;}
  td{border:1px solid #9ca3af;padding:4px 6px;vertical-align:top;}
  td.r{text-align:right;font-family:monospace;}
  td.c{text-align:center;}
  tr.total td{font-weight:700;background:#f3f4f6;}
  .info-table td{border:1px solid #9ca3af;padding:5px 8px;}
  .info-table td:first-child{font-weight:600;width:55%;}
  .period-box{text-align:right;margin-bottom:10px;font-size:11px;}
</style></head><body>
<h1>GSTR1 Report</h1>
${body}
<script>window.onload=function(){window.print();window.close();}<\/script>
</body></html>`);
        win.document.close();
    }, []);

    // Expose print fn to parent (for FilterBar PDF button)
    if (onPrint) onPrint(handlePrint);

    // ── Excel export ───────────────────────────────────────────────────────────
    const handleExcel = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Sale
        const saleRows = [
            ['GSTR-1 Report', '', '', '', '', '', '', '', '', ''],
            ['Period', periodLabel, '', '', '', '', '', '', '', ''],
            [],
            ['GSTIN/UIN', 'Invoice No.', 'Invoice Date', 'Invoice Value', 'Rate', 'Cess Rate', 'Taxable Value', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess', 'Place of Supply'],
            ...allSales.map(i => [
                i.gstin,
                i.invoice_number,
                fmtDate(i.date),
                (i as any).total ?? 0,
                0,
                0,
                i.taxable_value,
                i.igst,
                i.cgst,
                i.sgst,
                0,
                '—',
            ]),
            [],
            ['Total', '', '', allSales.reduce((s, i) => s + ((i as any).total ?? 0), 0), '', '',
                allSales.reduce((s, i) => s + i.taxable_value, 0),
                allSales.reduce((s, i) => s + i.igst, 0),
                allSales.reduce((s, i) => s + i.cgst, 0),
                allSales.reduce((s, i) => s + i.sgst, 0),
                0, ''],
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(saleRows);
        XLSX.utils.book_append_sheet(wb, ws1, 'Sale');

        // Sheet 2: HSN
        const hsnRows = [
            ['HSN Code', 'Description', 'Quantity', 'Taxable Value', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'],
            ...(data.hsn_summary ?? []).map(r => [r.hsn_code, r.description, r.quantity, r.taxable_value, r.igst, r.cgst, r.sgst, 0]),
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(hsnRows);
        XLSX.utils.book_append_sheet(wb, ws2, 'HSN Summary');

        XLSX.writeFile(wb, `GSTR1_${startDate}.xlsx`);
    };

    // ── Totals ─────────────────────────────────────────────────────────────────
    const totals = allSales.reduce(
        (acc, i) => ({
            value:   acc.value   + ((i as any).total ?? 0),
            taxable: acc.taxable + (i.taxable_value ?? 0),
            igst:    acc.igst    + (i.igst ?? 0),
            cgst:    acc.cgst    + (i.cgst ?? 0),
            sgst:    acc.sgst    + (i.sgst ?? 0),
        }),
        { value: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0 }
    );

    return (
        <div className="flex flex-col gap-4">

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={handleExcel}
                    className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Download Excel
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Printer className="w-4 h-4" /> Print / PDF
                </button>
            </div>

            {/* ── Report card ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

                {/* Title */}
                <div className="px-6 pt-6 pb-2 text-center border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white underline underline-offset-4 tracking-wide">
                        GSTR1 Report
                    </h2>
                </div>

                {/* Printable body */}
                <div ref={printRef} className="px-6 py-5 flex flex-col gap-6">

                    {/* ── Period + Header info ────────────────────────────── */}
                    <div>
                        <div className="text-right text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <span className="font-semibold">Period</span>&nbsp;&nbsp;{periodLabel}
                        </div>
                        <table className="w-full border-collapse text-sm info-table" style={{ maxWidth: 640 }}>
                            <tbody>
                                {[
                                    ['1. GSTIN', ''],
                                    ['2.a Legal name of the registered person', companyName],
                                    ['2.b Trade name, if any', ''],
                                    ['3.a Aggregate Turnover in the preceeding Financial Year.', ''],
                                    ['3.b Aggregate Turnover, April to June 2017', ''],
                                ].map(([label, val]) => (
                                    <tr key={label}>
                                        <td className={`${TD} w-[55%] font-semibold`}>{label}</td>
                                        <td className={TD}>{val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Sale section ────────────────────────────────────── */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white text-center underline underline-offset-4 mb-3">
                            Sale
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-[11px]">
                                <thead>
                                    {/* Row 1 */}
                                    <tr>
                                        <th className={TH} rowSpan={2}>GSTIN/<br />UIN</th>
                                        <th className={TH} colSpan={3}>Invoice details</th>
                                        <th className={TH} rowSpan={2}>Rate</th>
                                        <th className={TH} rowSpan={2}>Cess<br />Rate</th>
                                        <th className={TH} rowSpan={2}>Taxable<br />value</th>
                                        <th className={TH} colSpan={4}>Amount</th>
                                        <th className={TH} rowSpan={2}>Place of<br />Supply<br />(Name<br />of State)</th>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr>
                                        <th className={TH}>No.</th>
                                        <th className={TH}>Date</th>
                                        <th className={TH}>Value</th>
                                        <th className={TH}>Integrat<br />ed Tax</th>
                                        <th className={TH}>Central<br />Tax</th>
                                        <th className={TH}>State/UT<br />Tax</th>
                                        <th className={TH}>Cess</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allSales.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 italic border border-gray-200 dark:border-gray-700">
                                                No sales for this period
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {allSales.map((inv, i) => (
                                                <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/60 dark:bg-gray-700/20'}>
                                                    <td className={`${TD} font-mono text-[10px]`}>{inv.gstin}</td>
                                                    <td className={`${TD} font-mono`}>{inv.invoice_number}</td>
                                                    <td className={`${TD} whitespace-nowrap`}>{fmtDate(inv.date)}</td>
                                                    <td className={TDR}>{fmtN((inv as any).total ?? 0)}</td>
                                                    <td className={`${TD} text-center`}>—</td>
                                                    <td className={`${TD} text-center`}>0</td>
                                                    <td className={TDR}>{fmtN(inv.taxable_value)}</td>
                                                    <td className={TDR}>{fmtN(inv.igst)}</td>
                                                    <td className={TDR}>{fmtN(inv.cgst)}</td>
                                                    <td className={TDR}>{fmtN(inv.sgst)}</td>
                                                    <td className={`${TD} text-center`}>0</td>
                                                    <td className={`${TD} text-center`}>—</td>
                                                </tr>
                                            ))}
                                            {/* Total row */}
                                            <tr className="bg-gray-100 dark:bg-gray-700">
                                                <td colSpan={3} className={`${TDN} text-right`}>Total</td>
                                                <td className={TDN}>{fmtN(totals.value)}</td>
                                                <td className={`${TDN} text-center`}>—</td>
                                                <td className={`${TDN} text-center`}>0</td>
                                                <td className={TDN}>{fmtN(totals.taxable)}</td>
                                                <td className={TDN}>{fmtN(totals.igst)}</td>
                                                <td className={TDN}>{fmtN(totals.cgst)}</td>
                                                <td className={TDN}>{fmtN(totals.sgst)}</td>
                                                <td className={`${TDN} text-center`}>0</td>
                                                <td className={`${TDN} text-center`}>—</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Sale return section ─────────────────────────────── */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white text-center underline underline-offset-4 mb-3">
                            Sale return
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-[11px]">
                                <thead>
                                    {/* Row 1 */}
                                    <tr>
                                        <th className={TH} rowSpan={2}>GSTIN/<br />UIN</th>
                                        <th className={TH} colSpan={5}>Cr. Note details</th>
                                        <th className={TH} rowSpan={2}>Rate</th>
                                        <th className={TH} rowSpan={2}>Cess<br />Rate</th>
                                        <th className={TH} rowSpan={2}>Taxable<br />value</th>
                                        <th className={TH} colSpan={4}>Amount</th>
                                        <th className={TH} rowSpan={2}>Place of<br />Supply(Na<br />me of State)</th>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr>
                                        <th className={TH}>Invoic<br />e No.</th>
                                        <th className={TH}>Invoic<br />e Date</th>
                                        <th className={TH}>Retur<br />n No.</th>
                                        <th className={TH}>Retur<br />n<br />Date</th>
                                        <th className={TH}>Value</th>
                                        <th className={TH}>Integra<br />ted Tax</th>
                                        <th className={TH}>Central<br />Tax</th>
                                        <th className={TH}>State/U<br />T Tax</th>
                                        <th className={TH}>Cess</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={14} className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 italic border border-gray-200 dark:border-gray-700">
                                            No credit notes / sale returns for this period
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── HSN summary ─────────────────────────────────────── */}
                    {(data.hsn_summary ?? []).length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white text-center underline underline-offset-4 mb-3">
                                HSN-wise Summary
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[11px]">
                                    <thead>
                                        <tr>
                                            <th className={TH}>HSN Code</th>
                                            <th className={TH}>Description</th>
                                            <th className={TH}>UQC</th>
                                            <th className={TH}>Total Qty</th>
                                            <th className={TH}>Taxable Value</th>
                                            <th className={TH}>Integrated Tax</th>
                                            <th className={TH}>Central Tax</th>
                                            <th className={TH}>State/UT Tax</th>
                                            <th className={TH}>Cess</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.hsn_summary.map((r, i) => (
                                            <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/60 dark:bg-gray-700/20'}>
                                                <td className={`${TD} font-mono font-semibold`}>{r.hsn_code || '—'}</td>
                                                <td className={TD}>{r.description || '—'}</td>
                                                <td className={`${TD} text-center`}>NOS</td>
                                                <td className={TDR}>{Number(r.quantity ?? 0).toLocaleString('en-IN')}</td>
                                                <td className={TDR}>{fmtN(r.taxable_value)}</td>
                                                <td className={TDR}>{fmtN(r.igst)}</td>
                                                <td className={TDR}>{fmtN(r.cgst)}</td>
                                                <td className={TDR}>{fmtN(r.sgst)}</td>
                                                <td className={`${TD} text-center`}>0</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>{/* end printRef */}
            </div>
        </div>
    );
}
