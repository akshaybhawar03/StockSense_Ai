import { useRef, useCallback } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Gstr3bData } from '../../services/gst';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtN = (v: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);

// ── Cell styles ───────────────────────────────────────────────────────────────
const TH  = 'border border-gray-400 dark:border-gray-500 px-3 py-2 text-[11px] font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 align-middle';
const THC = 'border border-gray-400 dark:border-gray-500 px-3 py-2 text-[11px] font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 text-center align-middle';
const TD  = 'border border-gray-300 dark:border-gray-600 px-3 py-2 text-[11px] text-gray-700 dark:text-gray-300';
const TDR = 'border border-gray-300 dark:border-gray-600 px-3 py-2 text-[11px] text-right text-gray-700 dark:text-gray-300 font-mono tabular-nums';
const TDN = 'border border-gray-300 dark:border-gray-600 px-3 py-2 text-[11px] text-right font-bold text-gray-900 dark:text-white font-mono tabular-nums bg-gray-50 dark:bg-gray-800';
const TDB = 'border border-gray-300 dark:border-gray-600 px-3 py-2 text-[11px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700';

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ num, title }: { num: string; title: string }) {
    return (
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            <span className="mr-1">{num}.</span>{title}
        </h3>
    );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    data: Gstr3bData;
    startDate: string;
    endDate: string;
    onPrint?: (fn: () => void) => void;
}

export function Gstr3bReportView({ data, startDate, endDate, onPrint }: Props) {
    const printRef = useRef<HTMLDivElement>(null);
    const s = data.summary;

    const periodLabel = (() => {
        const sd = new Date(startDate);
        const ed = new Date(endDate);
        if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return `${startDate} to ${endDate}`;
        const sm = sd.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const em = ed.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        return sm === em ? sm : `${sm} – ${em}`;
    })();

    // ── Print ──────────────────────────────────────────────────────────────────
    const handlePrint = useCallback(() => {
        const body = printRef.current?.innerHTML ?? '';
        const win = window.open('', '_blank', 'width=1000,height=720');
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head><title>GSTR-3B Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:24px 32px;}
  h1{font-size:18px;font-weight:700;text-align:center;text-decoration:underline;margin-bottom:20px;}
  .section{margin-bottom:20px;}
  .sec-head{font-size:12px;font-weight:700;margin-bottom:6px;}
  table{width:100%;border-collapse:collapse;font-size:10.5px;}
  th{border:1px solid #666;padding:5px 7px;font-weight:700;text-align:left;background:#e5e7eb;vertical-align:middle;}
  th.c{text-align:center;}th.r{text-align:right;}
  td{border:1px solid #9ca3af;padding:4px 7px;}
  td.r{text-align:right;font-family:monospace;}
  td.c{text-align:center;}
  td.b{font-weight:700;}
  tr.sub td:first-child{padding-left:18px;}
  tr.foot td{font-weight:700;background:#f3f4f6;}
</style></head><body>
<h1>GSTR 3B Report (${periodLabel})</h1>
${body}
<script>window.onload=function(){window.print();window.close();}<\/script>
</body></html>`);
        win.document.close();
    }, [periodLabel]);

    if (onPrint) onPrint(handlePrint);

    // ── Excel ──────────────────────────────────────────────────────────────────
    const handleExcel = () => {
        const wb = XLSX.utils.book_new();
        const rows = [
            ['GSTR 3B Report', '', '', '', '', ''],
            ['Period', periodLabel, '', '', '', ''],
            [],
            ['Section 1: Details of outward supplies and inward supplies liable to reverse charge'],
            ['Nature of supplies', 'Total taxable value', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'],
            ['Outward taxable supplies (other than zero rated, nil rated and exempted)', s.taxable_value, s.igst, s.cgst, s.sgst, 0],
            ['Outward taxable supplies (zero rated)', 0, 0, 0, 0, 0],
            ['Other outward supplies (nil rated, exempted)', 0, 0, 0, 0, 0],
            ['Inward supplies (liable to reverse charge)', 0, 0, 0, 0, 0],
            ['Non-GST outward supplies', 0, 0, 0, 0, 0],
            [],
            ['Section 2: Details of inter-State supplies made to unregistered persons'],
            ['Place of supply', 'Taxable value (Unregd)', 'Integrated Tax (Unregd)', 'Taxable value (Comp)', 'Integrated Tax (Comp)', 'Taxable value (UIN)', 'Integrated Tax (UIN)'],
            [],
            ['Section 3: Details of eligible Input Tax Credit'],
            ['Details', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'],
            ['(A) ITC Available', '', '', '', ''],
            ['(1) Import of goods', 0, 0, 0, 0],
            ['(2) Import of services', 0, 0, 0, 0],
            ['(3) Inward supplies liable to reverse charge', 0, 0, 0, 0],
            ['(4) Inward supplies from ISD', 0, 0, 0, 0],
            ['(5) All other ITC', 0, 0, 0, 0],
            ['(D) Ineligible ITC', '', '', '', ''],
            ['(1) As per section 17(5)', 0, 0, 0, 0],
            ['(2) Others', 0, 0, 0, 0],
            [],
            ['Section 4: Details of exempt, nil-rated and non-GST inward supplies'],
            ['Nature of supplies', 'Inter-State supplies', 'Intra-State supplies'],
            ['From a supplier under composition scheme, Exempt and Nil rated supply', 0, 0],
            ['Non GST supply', 0, 0],
            [],
            ['Net GST Liability', s.igst + s.cgst + s.sgst],
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'GSTR-3B');
        XLSX.writeFile(wb, `GSTR3B_${startDate}.xlsx`);
    };

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
                        GSTR 3B Report ({periodLabel})
                    </h2>
                </div>

                {/* Printable body */}
                <div ref={printRef} className="px-6 py-5 flex flex-col gap-7">

                    {/* ── Section 1 ──────────────────────────────────────── */}
                    <div className="section">
                        <SectionHead num="1" title="Details of outward supplies and inward supplies liable to reverse charge" />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className={TH} style={{ minWidth: 300 }}>Nature of supplies</th>
                                        <th className={`${THC} whitespace-nowrap`}>Total<br />taxable<br />value</th>
                                        <th className={`${THC} whitespace-nowrap`}>Integrated Tax</th>
                                        <th className={`${THC} whitespace-nowrap`}>Central Tax</th>
                                        <th className={`${THC} whitespace-nowrap`}>State/UT Tax</th>
                                        <th className={`${THC} whitespace-nowrap`}>Cess</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            label: 'Outward taxable supplies (other than zero rated, nil rated and exempted)',
                                            taxable: s.taxable_value, igst: s.igst, cgst: s.cgst, sgst: s.sgst,
                                        },
                                        { label: 'Outward taxable supplies (zero rated)', taxable: 0, igst: 0, cgst: 0, sgst: 0 },
                                        { label: 'Other outward supplies (nil rated, exempted)', taxable: 0, igst: 0, cgst: 0, sgst: 0 },
                                        { label: 'Inward supplies (liable to reverse charge)', taxable: 0, igst: 0, cgst: 0, sgst: 0 },
                                        { label: 'Non-GST outward supplies', taxable: 0, igst: 0, cgst: 0, sgst: 0 },
                                    ].map((row, i) => (
                                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-700/20'}>
                                            <td className={TD}>{row.label}</td>
                                            <td className={TDR}>{fmtN(row.taxable)}</td>
                                            <td className={TDR}>{fmtN(row.igst)}</td>
                                            <td className={TDR}>{fmtN(row.cgst)}</td>
                                            <td className={TDR}>{fmtN(row.sgst)}</td>
                                            <td className={TDR}>0</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Section 2 ──────────────────────────────────────── */}
                    <div className="section">
                        <SectionHead num="2" title="Details of inter-State supplies made to unregistered persons, composition dealer and UIN holders" />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className={TH} rowSpan={2} style={{ minWidth: 160 }}>Place of supply<br />(State/UT)</th>
                                        <th className={THC} colSpan={2}>Supplies made to unregistered persons</th>
                                        <th className={THC} colSpan={2}>Supplies made to composition taxable persons</th>
                                        <th className={THC} colSpan={2}>Supplies made to UIN holders</th>
                                    </tr>
                                    <tr>
                                        <th className={THC}>Total taxable<br />value</th>
                                        <th className={THC}>Amount of<br />integrated tax</th>
                                        <th className={THC}>Total taxable<br />value</th>
                                        <th className={THC}>Amount of<br />integrated tax</th>
                                        <th className={THC}>Total<br />taxable<br />value</th>
                                        <th className={THC}>Amount of<br />integrated<br />tax</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={7} className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 italic border border-gray-200 dark:border-gray-700">
                                            No inter-state supply data for this period
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Section 3 ──────────────────────────────────────── */}
                    <div className="section">
                        <SectionHead num="3" title="Details of eligible Input Tax Credit" />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className={TH} style={{ minWidth: 320 }}>Details</th>
                                        <th className={THC}>Integrated Tax</th>
                                        <th className={THC}>Central Tax</th>
                                        <th className={THC}>State/UT Tax</th>
                                        <th className={THC}>Cess</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* A header */}
                                    <tr>
                                        <td className={`${TDB} font-bold`} colSpan={5}>(A) ITC Available (whether in full or part)</td>
                                    </tr>
                                    {[
                                        '(1) Import of goods',
                                        '(2) Import of services',
                                        '(3) Inward supplies liable to reverse charge (other than 1 & 2 above)',
                                        '(4) Inward supplies from ISD',
                                        '(5) All other ITC',
                                    ].map((label, i) => (
                                        <tr key={i} className="border-l-4 border-l-transparent">
                                            <td className={`${TD} pl-6`}>{label}</td>
                                            <td className={TDR}>0</td>
                                            <td className={TDR}>0</td>
                                            <td className={TDR}>0</td>
                                            <td className={TDR}>0</td>
                                        </tr>
                                    ))}
                                    {/* D header */}
                                    <tr>
                                        <td className={`${TDB} font-bold`} colSpan={5}>(D) Ineligible ITC</td>
                                    </tr>
                                    {[
                                        '(1) As per section 17(5)',
                                        '(2) Others',
                                    ].map((label, i) => (
                                        <tr key={i}>
                                            <td className={`${TD} pl-6`}>{label}</td>
                                            <td className={TDR}>0</td>
                                            <td className={TDR}>0</td>
                                            <td className={TDR}>0</td>
                                            <td className={TDR}>0</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Section 4 ──────────────────────────────────────── */}
                    <div className="section">
                        <SectionHead num="4" title="Details of exempt, nil-rated and non-GST inward supplies" />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className={TH} style={{ minWidth: 340 }}>Nature of supplies</th>
                                        <th className={THC}>Inter-State supplies</th>
                                        <th className={THC}>Intra-State supplies</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'From a supplier under composition scheme, Exempt and Nil rated supply',
                                        'Non GST supply',
                                    ].map((label, i) => (
                                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-700/20'}>
                                            <td className={TD}>{label}</td>
                                            <td className={TDR}>0</td>
                                            <td className={TDR}>0</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Net GST summary ─────────────────────────────────── */}
                    <div className="section">
                        <SectionHead num="5" title="Net GST Liability" />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className={TH} style={{ minWidth: 220 }}>Description</th>
                                        <th className={THC}>Integrated Tax</th>
                                        <th className={THC}>Central Tax</th>
                                        <th className={THC}>State/UT Tax</th>
                                        <th className={THC}>Total Tax</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className={TD}>Total outward taxable supplies</td>
                                        <td className={TDR}>{fmtN(s.igst)}</td>
                                        <td className={TDR}>{fmtN(s.cgst)}</td>
                                        <td className={TDR}>{fmtN(s.sgst)}</td>
                                        <td className={TDN}>{fmtN(s.igst + s.cgst + s.sgst)}</td>
                                    </tr>
                                    <tr className="bg-emerald-50/60 dark:bg-emerald-900/10">
                                        <td className={`${TD} font-bold text-gray-900 dark:text-white`}>Net GST Liability</td>
                                        <td className={TDN}>{fmtN(s.igst)}</td>
                                        <td className={TDN}>{fmtN(s.cgst)}</td>
                                        <td className={TDN}>{fmtN(s.sgst)}</td>
                                        <td className={`${TDN} text-[rgb(var(--accent-primary))]`}>
                                            {fmtN(s.net_gst_liability ?? (s.igst + s.cgst + s.sgst))}
                                        </td>
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
