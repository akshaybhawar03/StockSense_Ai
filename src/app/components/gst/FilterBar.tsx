import { Loader2, FileDown, Sheet } from 'lucide-react';

interface Props {
    startDate: string;
    endDate: string;
    loading: boolean;
    canDownload: boolean;
    downloadingPdf: boolean;
    downloadingExcel: boolean;
    onStartDateChange: (v: string) => void;
    onEndDateChange: (v: string) => void;
    onGenerate: () => void;
    onDownloadPdf: () => void;
    onDownloadExcel: () => void;
}

export function FilterBar({
    startDate, endDate, loading, canDownload,
    downloadingPdf, downloadingExcel,
    onStartDateChange, onEndDateChange,
    onGenerate, onDownloadPdf, onDownloadExcel,
}: Props) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-end gap-3">
                {/* Start date */}
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => onStartDateChange(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                </div>

                {/* End date */}
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => onEndDateChange(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                </div>

                {/* Generate */}
                <button
                    onClick={onGenerate}
                    disabled={loading || !startDate || !endDate}
                    className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : 'Generate Report'}
                </button>

                {/* Downloads — only visible once report is ready */}
                {canDownload && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={onDownloadPdf}
                            disabled={downloadingPdf}
                            className="flex-1 sm:flex-none h-10 px-4 rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 text-red-700 dark:text-red-400 text-sm font-medium flex items-center gap-2 transition-colors justify-center"
                        >
                            {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                            PDF
                        </button>
                        <button
                            onClick={onDownloadExcel}
                            disabled={downloadingExcel}
                            className="flex-1 sm:flex-none h-10 px-4 rounded-lg border border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2 transition-colors justify-center"
                        >
                            {downloadingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sheet className="w-4 h-4" />}
                            Excel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
