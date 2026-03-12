import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { 
    Table, 
    BarChart3, 
    Hash, 
    Type, 
    DownloadCloud,
    Filter,
    ArrowUpDown,
    Maximize2
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';

export function PowerBIDashboard() {
    const { datasets } = useData();
    const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

    // Default to the most recently uploaded dataset
    const activeDataset = useMemo(() => {
        if (!datasets || datasets.length === 0) return null;
        if (selectedDatasetId) {
            return datasets.find(d => d.id === selectedDatasetId) || datasets[0];
        }
        return datasets[datasets.length - 1];
    }, [datasets, selectedDatasetId]);

    // Analyze dataset to find numeric and categorical columns
    const analysis = useMemo(() => {
        if (!activeDataset || !activeDataset.rows.length) return null;

        const firstRow = activeDataset.rows[0];
        const numericColumns: string[] = [];
        const stringColumns: string[] = [];

        // Simple type inference
        for (const [key, value] of Object.entries(firstRow)) {
            if (typeof value === 'number') {
                numericColumns.push(key);
            } else if (typeof value === 'string') {
                stringColumns.push(key);
            }
        }

        // Generate KPIs by summing up numeric columns
        const kpis = numericColumns.slice(0, 4).map(col => {
            const sum = activeDataset.rows.reduce((acc, row) => {
                const val = Number(row[col]);
                return acc + (isNaN(val) ? 0 : val);
            }, 0);
            return { label: col, value: sum };
        });

        // Prepare chart data (Group by first string column, sum by first numeric column)
        let chartData: any[] = [];
        let xAxisProp = '';
        let yAxisProp = '';

        if (stringColumns.length > 0 && numericColumns.length > 0) {
            xAxisProp = stringColumns[0];
            yAxisProp = numericColumns[0];
            
            const groupMap = new Map<string, number>();
            activeDataset.rows.forEach(row => {
                const xVal = String(row[xAxisProp] || 'Unknown');
                const yVal = Number(row[yAxisProp]) || 0;
                groupMap.set(xVal, (groupMap.get(xVal) || 0) + yVal);
            });

            // Sort and take top 10 to keep chart readable
            chartData = Array.from(groupMap.entries())
                .map(([name, value]) => ({ [xAxisProp]: name, [yAxisProp]: value }))
                .sort((a, b) => (Number(b[yAxisProp]) || 0) - (Number(a[yAxisProp]) || 0))
                .slice(0, 10);
        }

        return { numericColumns, stringColumns, kpis, chartData, xAxisProp, yAxisProp };

    }, [activeDataset]);

    if (!activeDataset || !analysis) {
        return null;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <BarChart3 className="w-5 h-5 text-teal-500" />
                        Dynamic Dataset View
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        Viewing: <span className="font-semibold text-gray-700 dark:text-gray-300">{activeDataset.fileName}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">{activeDataset.rows.length} rows</span>
                    </p>
                </div>

                {datasets.length > 1 && (
                    <select 
                        className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        value={activeDataset.id}
                        onChange={(e) => setSelectedDatasetId(e.target.value)}
                    >
                        {datasets.map(d => (
                            <option key={d.id} value={d.id}>{d.fileName}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Dynamic KPIs */}
            {analysis.kpis.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {analysis.kpis.map((kpi, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-4 border-l-4 border-l-teal-500 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">Total {kpi.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {kpi.value > 1000 
                                                ? kpi.value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                : kpi.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-lg">
                                        <Hash className="w-4 h-4" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Chart Module */}
            {analysis.chartData.length > 0 && (
                <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                            {analysis.yAxisProp} by {analysis.xAxisProp}
                        </h3>
                        <div className="text-xs text-gray-400">Top 10 aggregate distribution</div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysis.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis 
                                    dataKey={analysis.xAxisProp} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar 
                                    dataKey={analysis.yAxisProp} 
                                    fill="url(#colorUv)" 
                                    radius={[4, 4, 0, 0]} 
                                />
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Raw Data Grid */}
            <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Table className="w-5 h-5 text-blue-500" />
                        Raw Extracted Data
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                            <Filter className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {activeDataset.columns.map((col, idx) => (
                                    <th key={idx} className="px-6 py-3 font-semibold whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            {analysis.numericColumns.includes(col) ? <Hash className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                                            {col}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {activeDataset.rows.slice(0, 100).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                    {activeDataset.columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                            {row[col]?.toString() || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                    Showing top 100 rows. Use global search for deep querying.
                </div>
            </Card>

        </div>
    );
}

