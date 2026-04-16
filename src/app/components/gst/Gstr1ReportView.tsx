import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { Gstr1Data, B2BInvoice, B2CInvoice, HsnSummary } from '../../services/gst';

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtN = (v: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);

const fmtDate = (d: string) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Shared cell classes ───────────────────────────────────────────────────────

const TH = 'px-3 py-2.5 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 whitespace-nowrap';
const THR = 'px-3 py-2.5 text-right text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 whitespace-nowrap';
const TD = 'px-3 py-2 text-[12px] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
const TDR = 'px-3 py-2 text-[12px] text-right text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-mono tabular-nums';
const TDN = 'px-3 py-2 text-[12px] font-semibold text-right text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-mono tabular-nums';

// ── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ num, title }: { num: string; title: string }) {
    return (
        <div className="flex items-baseline gap-2 mb-3">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 shrink-0">{num}.</span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
    );
}

// ── Empty row ─────────────────────────────────────────────────────────────────
function EmptyRow({ cols }: { cols: number }) {
    return (
        <tr>
            <td colSpan={cols} className="py-6 text-center text-sm text-gray-400 dark:text-gray-500 italic border border-gray-200 dark:border-gray-700">
                No data for this period
            </td>
        </tr>
    );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    data: Gstr1Data;
    startDate: string;
    endDate: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Gstr1ReportView({ data, startDate, endDate }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    const b2b = data.b2b_invoices ?? [];
    const b2c = data.b2c_invoices ?? [];
    const hsn = data.hsn_summary ?? [];

    // Aggregate totals for Section 1 summary table
    const sumB2B = b2b.reduce(
        (acc, i) => ({
            taxable: acc.taxable + (i.taxable_value ?? 0),
            igst:    acc.igst    + (i.igst ?? 0),
            cgst:    acc.cgst    + (i.cgst ?? 0),
            sgst:    acc.sgst    + (i.sgst ?? 0),
            total:   acc.total   + (i.total ?? 0),
        }),
        { taxable: 0, igst: 0, cgst: 0, sgst: 0, total: 0 }
    );
    const sumB2C = b2c.reduce(
        (acc, i) => ({
            taxable: acc.taxable + (i.taxable_value ?? 0),
            igst:    acc.igst    + (i.igst ?? 0),
            cgst:    acc.cgst    + (i.cgst ?? 0),
            sgst:    acc.sgst    + (i.sgst ?? 0),
            total:   acc.total   + (i.total ?? 0),
        }),
        { taxable: 0, igst: 0, cgst: 0, sgst: 0, total: 0 }
    );
    const grand = {
        taxable: sumB2B.taxable + sumB2C.taxable,
        igst:    sumB2B.igst    + sumB2C.igst,
        cgst:    sumB2B.cgst    + sumB2C.cgst,
        sgst:    sumB2B.sgst    + sumB2C.sgst,
        total:   sumB2B.total   + sumB2C.total,
    };

    // Period label
    const periodLabel = (() => {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${startDate} to ${endDate}`;
        const sm = s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const em = e.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        return sm === em ? sm : `${sm} – ${em}`;
    })();

    // Print: open new window with clean HTML
    const handlePrint = () => {
        const node = printRef.current;
        if (!node) return;
        const win = window.open('', '_blank', 'width=960,height=720');
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head><title>GSTR-1 Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:28px 36px;}
  h1{font-size:17px;font-weight:700;text-align:center;text-decoration:underline;margin-bottom:24px;}
  .section{margin-bottom:24px;}
  .section-label{font-size:12px;font-weight:700;margin-bottom:8px;}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:4px;}
  th{background:#f3f4f6;border:1px solid #9ca3af;padding:6px 8px;font-weight:700;text-align:left;white-space:nowrap;}
  th.r{text-align:right;}
  td{border:1px solid #d1d5db;padding:5px 8px;vertical-align:top;}
  td.r{text-align:right;font-family:monospace;}
  td.bold{font-weight:700;background:#f9fafb;}
  td.bold.r{text-align:right;font-weight:700;background:#f9fafb;font-family:monospace;}
  .empty{color:#6b7280;font-style:italic;text-align:center;padding:10px;}
</style></head><body>
<h1>GSTR-1 Report (${periodLabel})</h1>
${node.innerHTML}
<script>window.onload=function(){window.print();window.close();}<\/script>
</body></html>`);
        win.document.close();
    };

    return (
        <div className="flex flex-col gap-5">

            {/* Print button */}
            <div className="flex justify-end">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Printer className="w-4 h-4" /> Print / Download PDF
                </button>
            </div>

            {/* ── Report card ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

                {/* Report title */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 text-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white underline underline-offset-4">
                        GSTR-1 Report ({periodLabel})
                    </h2>
                </div>

                {/* Printable body */}
                <div ref={printRef} className="px-6 py-6 flex flex-col gap-7">

                    {/* ── Section 1: Outward supplies summary ──────────────── */}
                    <div className="section">
                        <SectionTitle
                            num="1"
                            title="Details of outward supplies (Summary)"
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className={TH} style={{ minWidth: 260 }}>Nature of Supplies</th>
                                        <th className={THR}>Total Taxable Value (₹)</th>
                                        <th className={THR}>Integrated Tax (₹)</th>
                                        <th className={THR}>Central Tax (₹)</th>
                                        <th className={THR}>State/UT Tax (₹)</th>
                                        <th className={THR}>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="even:bg-gray-50/50 dark:even:bg-gray-700/20">
                                        <td className={TD}>Outward taxable supplies to registered persons (B2B)</td>
                                        <td className={TDR}>{fmtN(sumB2B.taxable)}</td>
                                        <td className={TDR}>{fmtN(sumB2B.igst)}</td>
                                        <td className={TDR}>{fmtN(sumB2B.cgst)}</td>
                                        <td className={TDR}>{fmtN(sumB2B.sgst)}</td>
                                        <td className={TDR}>0.00</td>
                                    </tr>
                                    <tr className="even:bg-gray-50/50 dark:even:bg-gray-700/20">
                                        <td className={TD}>Outward taxable supplies to unregistered persons (B2C)</td>
                                        <td className={TDR}>{fmtN(sumB2C.taxable)}</td>
                                        <td className={TDR}>{fmtN(sumB2C.igst)}</td>
                                        <td className={TDR}>{fmtN(sumB2C.cgst)}</td>
                                        <td className={TDR}>{fmtN(sumB2C.sgst)}</td>
                                        <td className={TDR}>0.00</td>
                                    </tr>
                                    <tr className="even:bg-gray-50/50 dark:even:bg-gray-700/20">
                                        <td className={TD}>Other outward supplies (nil rated, exempted)</td>
                                        <td className={TDR}>0.00</td>
                                        <td className={TDR}>0.00</td>
                                        <td className={TDR}>0.00</td>
                                        <td className={TDR}>0.00</td>
                                        <td className={TDR}>0.00</td>
                                    </tr>
                                    <tr className="bg-emerald-50/60 dark:bg-emerald-900/10">
                                        <td className={`${TD} font-bold text-gray-900 dark:text-white`}>Total Outward Supplies</td>
                                        <td className={TDN}>{fmtN(grand.taxable)}</td>
                                        <td className={TDN}>{fmtN(grand.igst)}</td>
                                        <td className={TDN}>{fmtN(grand.cgst)}</td>
                                        <td className={TDN}>{fmtN(grand.sgst)}</td>
                                        <td className={TDN}>0.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Section 2: B2B invoice details ───────────────────── */}
                    <div className="section">
                        <SectionTitle
                            num="2"
                            title="Table 4A — Taxable outward supplies to registered persons (B2B)"
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className={TH}>#</th>
                                        <th className={TH}>Invoice No.</th>
                                        <th className={TH}>Invoice Date</th>
                                        <th className={TH}>Customer Name</th>
                                        <th className={TH}>GSTIN</th>
                                        <th className={THR}>Taxable Value (₹)</th>
                                        <th className={THR}>Integrated Tax (₹)</th>
                                        <th className={THR}>Central Tax (₹)</th>
                                        <th className={THR}>State/UT Tax (₹)</th>
                                        <th className={THR}>Invoice Value (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {b2b.length === 0
                                        ? <EmptyRow cols={10} />
                                        : b2b.map((inv: B2BInvoice, i) => (
                                            <tr key={inv.invoice_number ?? i} className="even:bg-gray-50/50 dark:even:bg-gray-700/20 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-colors">
                                                <td className={`${TD} text-gray-400 dark:text-gray-500 text-[11px] tabular-nums`}>{i + 1}</td>
                                                <td className={`${TD} font-mono font-medium`}>{inv.invoice_number}</td>
                                                <td className={`${TD} whitespace-nowrap`}>{fmtDate(inv.date)}</td>
                                                <td className={`${TD} max-w-[140px]`}>
                                                    <span className="block truncate">{inv.customer_name || '—'}</span>
                                                </td>
                                                <td className={`${TD} font-mono text-[11px]`}>{inv.gstin || '—'}</td>
                                                <td className={TDR}>{fmtN(inv.taxable_value)}</td>
                                                <td className={TDR}>{fmtN(inv.igst)}</td>
                                                <td className={TDR}>{fmtN(inv.cgst)}</td>
                                                <td className={TDR}>{fmtN(inv.sgst)}</td>
                                                <td className={TDN}>{fmtN(inv.total)}</td>
                                            </tr>
                                        ))
                                    }
                                    {b2b.length > 0 && (
                                        <tr className="bg-gray-100 dark:bg-gray-700/50">
                                            <td colSpan={5} className={`${TD} font-bold text-gray-900 dark:text-white text-right`}>Total</td>
                                            <td className={TDN}>{fmtN(sumB2B.taxable)}</td>
                                            <td className={TDN}>{fmtN(sumB2B.igst)}</td>
                                            <td className={TDN}>{fmtN(sumB2B.cgst)}</td>
                                            <td className={TDN}>{fmtN(sumB2B.sgst)}</td>
                                            <td className={TDN}>{fmtN(sumB2B.total)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Section 3: B2C invoice details ───────────────────── */}
                    <div className="section">
                        <SectionTitle
                            num="3"
                            title="Table 7 — Taxable outward supplies to unregistered persons (B2C)"
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className={TH}>#</th>
                                        <th className={TH}>Invoice No.</th>
                                        <th className={TH}>Invoice Date</th>
                                        <th className={TH}>Customer Name</th>
                                        <th className={THR}>Taxable Value (₹)</th>
                                        <th className={THR}>Integrated Tax (₹)</th>
                                        <th className={THR}>Central Tax (₹)</th>
                                        <th className={THR}>State/UT Tax (₹)</th>
                                        <th className={THR}>Invoice Value (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {b2c.length === 0
                                        ? <EmptyRow cols={9} />
                                        : b2c.map((inv: B2CInvoice, i) => (
                                            <tr key={inv.invoice_number ?? i} className="even:bg-gray-50/50 dark:even:bg-gray-700/20 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-colors">
                                                <td className={`${TD} text-gray-400 dark:text-gray-500 text-[11px] tabular-nums`}>{i + 1}</td>
                                                <td className={`${TD} font-mono font-medium`}>{inv.invoice_number}</td>
                                                <td className={`${TD} whitespace-nowrap`}>{fmtDate(inv.date)}</td>
                                                <td className={`${TD} max-w-[160px]`}>
                                                    <span className="block truncate">{inv.customer_name || '—'}</span>
                                                </td>
                                                <td className={TDR}>{fmtN(inv.taxable_value)}</td>
                                                <td className={TDR}>{fmtN(inv.igst)}</td>
                                                <td className={TDR}>{fmtN(inv.cgst)}</td>
                                                <td className={TDR}>{fmtN(inv.sgst)}</td>
                                                <td className={TDN}>{fmtN(inv.total)}</td>
                                            </tr>
                                        ))
                                    }
                                    {b2c.length > 0 && (
                                        <tr className="bg-gray-100 dark:bg-gray-700/50">
                                            <td colSpan={4} className={`${TD} font-bold text-gray-900 dark:text-white text-right`}>Total</td>
                                            <td className={TDN}>{fmtN(sumB2C.taxable)}</td>
                                            <td className={TDN}>{fmtN(sumB2C.igst)}</td>
                                            <td className={TDN}>{fmtN(sumB2C.cgst)}</td>
                                            <td className={TDN}>{fmtN(sumB2C.sgst)}</td>
                                            <td className={TDN}>{fmtN(sumB2C.total)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Section 4: HSN summary ────────────────────────────── */}
                    <div className="section">
                        <SectionTitle
                            num="4"
                            title="Table 12 — HSN-wise summary of outward supplies"
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className={TH}>HSN Code</th>
                                        <th className={TH}>Description</th>
                                        <th className={THR}>Total Quantity</th>
                                        <th className={THR}>Taxable Value (₹)</th>
                                        <th className={THR}>Integrated Tax (₹)</th>
                                        <th className={THR}>Central Tax (₹)</th>
                                        <th className={THR}>State/UT Tax (₹)</th>
                                        <th className={THR}>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hsn.length === 0
                                        ? <EmptyRow cols={8} />
                                        : hsn.map((row: HsnSummary, i) => (
                                            <tr key={row.hsn_code ?? i} className="even:bg-gray-50/50 dark:even:bg-gray-700/20 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-colors">
                                                <td className={`${TD} font-mono font-semibold`}>{row.hsn_code || '—'}</td>
                                                <td className={`${TD} max-w-[200px]`}>
                                                    <span className="block truncate">{row.description || '—'}</span>
                                                </td>
                                                <td className={TDR}>{Number(row.quantity ?? 0).toLocaleString('en-IN')}</td>
                                                <td className={TDR}>{fmtN(row.taxable_value)}</td>
                                                <td className={TDR}>{fmtN(row.igst)}</td>
                                                <td className={TDR}>{fmtN(row.cgst)}</td>
                                                <td className={TDR}>{fmtN(row.sgst)}</td>
                                                <td className={TDR}>0.00</td>
                                            </tr>
                                        ))
                                    }
                                    {hsn.length > 0 && (
                                        <tr className="bg-gray-100 dark:bg-gray-700/50">
                                            <td colSpan={3} className={`${TD} font-bold text-gray-900 dark:text-white text-right`}>Total</td>
                                            <td className={TDN}>{fmtN(hsn.reduce((s, r) => s + (r.taxable_value ?? 0), 0))}</td>
                                            <td className={TDN}>{fmtN(hsn.reduce((s, r) => s + (r.igst ?? 0), 0))}</td>
                                            <td className={TDN}>{fmtN(hsn.reduce((s, r) => s + (r.cgst ?? 0), 0))}</td>
                                            <td className={TDN}>{fmtN(hsn.reduce((s, r) => s + (r.sgst ?? 0), 0))}</td>
                                            <td className={TDN}>0.00</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Section 5: Grand totals ────────────────────────────── */}
                    <div className="section">
                        <SectionTitle
                            num="5"
                            title="Summary of tax liability"
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className={TH} style={{ minWidth: 220 }}>Description</th>
                                        <th className={THR}>Total Taxable Value (₹)</th>
                                        <th className={THR}>Integrated Tax (₹)</th>
                                        <th className={THR}>Central Tax (₹)</th>
                                        <th className={THR}>State/UT Tax (₹)</th>
                                        <th className={THR}>Total Tax (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="even:bg-gray-50/50 dark:even:bg-gray-700/20">
                                        <td className={TD}>Total outward taxable supplies</td>
                                        <td className={TDR}>{fmtN(grand.taxable)}</td>
                                        <td className={TDR}>{fmtN(grand.igst)}</td>
                                        <td className={TDR}>{fmtN(grand.cgst)}</td>
                                        <td className={TDR}>{fmtN(grand.sgst)}</td>
                                        <td className={TDN}>{fmtN(grand.igst + grand.cgst + grand.sgst)}</td>
                                    </tr>
                                    <tr className="bg-emerald-50/70 dark:bg-emerald-900/10">
                                        <td className={`${TD} font-bold text-gray-900 dark:text-white`}>Net Tax Liability</td>
                                        <td className={TDN}>{fmtN(grand.taxable)}</td>
                                        <td className={TDN}>{fmtN(grand.igst)}</td>
                                        <td className={TDN}>{fmtN(grand.cgst)}</td>
                                        <td className={TDN}>{fmtN(grand.sgst)}</td>
                                        <td className={`${TDN} text-[rgb(var(--accent-primary))]`}>{fmtN(grand.igst + grand.cgst + grand.sgst)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>{/* end printRef */}
            </div>
        </div>
    );
}
