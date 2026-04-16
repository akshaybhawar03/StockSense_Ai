import { useState, useRef } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGstr1, getGstr3b, Gstr1Data, Gstr3bData } from '../services/gst';
import { SummaryCards } from '../components/gst/SummaryCards';
import { Gstr1ReportView } from '../components/gst/Gstr1ReportView';
import { Gstr3bReportView } from '../components/gst/Gstr3bReportView';
import { FilterBar } from '../components/gst/FilterBar';

const formatINR = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v ?? 0);

// Default date range: first day of current month → today
const firstOfMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};
const todayStr = () => new Date().toISOString().split('T')[0];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl h-20" />
                ))}
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-48" />
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-48" />
        </div>
    );
}

export function GstReportPage() {
    const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b'>('gstr1');
    const [startDate, setStartDate] = useState(firstOfMonth());
    const [endDate, setEndDate]     = useState(todayStr());
    const [gstr1Data, setGstr1Data] = useState<Gstr1Data | null>(null);
    const [gstr3bData, setGstr3bData] = useState<Gstr3bData | null>(null);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);

    // Holds the print function registered by the active report view
    const printFnRef = useRef<(() => void) | null>(null);
    // Holds the excel function registered by the active report view
    const excelFnRef = useRef<(() => void) | null>(null);

    const hasReport = activeTab === 'gstr1' ? !!gstr1Data : !!gstr3bData;

    async function handleGenerate() {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }
        if (startDate > endDate) {
            toast.error('Start date cannot be after end date');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (activeTab === 'gstr1') {
                const res = await getGstr1(startDate, endDate);
                setGstr1Data(res.data);
            } else {
                const res = await getGstr3b(startDate, endDate);
                setGstr3bData(res.data);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.detail
                || err?.response?.data?.message
                || err?.message
                || 'Failed to generate report';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    // FilterBar PDF button → triggers the formatted print window
    function handleDownloadPdf() {
        if (printFnRef.current) {
            printFnRef.current();
        } else {
            toast.error('Generate a report first, then download PDF');
        }
    }

    // FilterBar Excel button → triggers the in-browser Excel export
    function handleDownloadExcel() {
        if (excelFnRef.current) {
            excelFnRef.current();
        } else {
            toast.error('Generate a report first, then download Excel');
        }
    }

    function handleTabChange(tab: 'gstr1' | 'gstr3b') {
        setActiveTab(tab);
        setError(null);
        printFnRef.current = null;
        excelFnRef.current = null;
    }

    // ── Summary cards ─────────────────────────────────────────────────────────
    const gstr1Cards = gstr1Data?.summary ? [
        { label: 'Total Invoices',      value: String(gstr1Data.summary.total_invoices ?? 0) },
        { label: 'Total Taxable Value', value: formatINR(gstr1Data.summary.total_taxable_value) },
        { label: 'Total GST',           value: formatINR(gstr1Data.summary.total_gst) },
        { label: 'Total Invoice Value', value: formatINR(gstr1Data.summary.total_invoice_value), highlight: true },
    ] : [];

    // Normalise: backend may return summary at root level instead of nested
    const g3bRaw = gstr3bData as any;
    const g3b = gstr3bData?.summary ?? g3bRaw?.data?.summary ?? g3bRaw?.gstr3b?.summary ?? g3bRaw;
    const gstr3bCards = g3b?.taxable_value !== undefined ? [
        { label: 'Total Sales',       value: formatINR(g3b.total_sales ?? 0) },
        { label: 'Taxable Value',     value: formatINR(g3b.taxable_value ?? 0) },
        { label: 'CGST',              value: formatINR(g3b.cgst ?? 0) },
        { label: 'SGST',              value: formatINR(g3b.sgst ?? 0) },
        { label: 'IGST',              value: formatINR(g3b.igst ?? 0) },
        { label: 'Net GST Liability', value: formatINR(g3b.net_gst_liability ?? (g3b.igst + g3b.cgst + g3b.sgst)), highlight: true },
    ] : [];

    return (
        <div className="flex flex-col gap-6">

            {/* ── Page header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">GST Reports</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Generate GSTR-1 and GSTR-3B in official format
                        </p>
                    </div>
                </div>

                {/* Tab toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 self-start sm:self-auto">
                    {(['gstr1', 'gstr3b'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                activeTab === tab
                                    ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab === 'gstr1' ? 'GSTR-1' : 'GSTR-3B'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Filter bar ──────────────────────────────────────────────── */}
            <FilterBar
                startDate={startDate}
                endDate={endDate}
                loading={loading}
                canDownload={hasReport}
                downloadingPdf={false}
                downloadingExcel={false}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onGenerate={handleGenerate}
                onDownloadPdf={handleDownloadPdf}
                onDownloadExcel={handleDownloadExcel}
            />

            {/* ── Error ───────────────────────────────────────────────────── */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to generate report</p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* ── Loading skeleton ─────────────────────────────────────────── */}
            {loading && <Skeleton />}

            {/* ── GSTR-1 content ──────────────────────────────────────────── */}
            {!loading && activeTab === 'gstr1' && gstr1Data && (
                <div className="flex flex-col gap-5">
                    <SummaryCards cards={gstr1Cards} />
                    <Gstr1ReportView
                        data={gstr1Data}
                        startDate={startDate}
                        endDate={endDate}
                        onPrint={fn => { printFnRef.current = fn; }}
                    />
                </div>
            )}

            {/* ── GSTR-3B content ─────────────────────────────────────────── */}
            {!loading && activeTab === 'gstr3b' && gstr3bData && (
                <div className="flex flex-col gap-5">
                    <SummaryCards cards={gstr3bCards} />
                    <Gstr3bReportView
                        data={gstr3bData}
                        startDate={startDate}
                        endDate={endDate}
                        onPrint={fn => { printFnRef.current = fn; }}
                    />
                </div>
            )}

            {/* ── Empty / initial state ────────────────────────────────────── */}
            {!loading && !hasReport && !error && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-gray-700 dark:text-gray-200">No report generated yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Select a date range above and click <strong>Generate Report</strong>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
