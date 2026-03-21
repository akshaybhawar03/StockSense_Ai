import React, { useState } from 'react';
import { streamAnalysis, getLowStockInsight, getDeadStockInsight } from '../../services/ai';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Bot, Sparkles, TrendingDown, AlertTriangle } from 'lucide-react';

export function AiReportPage() {
    const [report, setReport] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [insight, setInsight] = useState('');
    const [insightLoading, setInsightLoading] = useState(false);

    React.useEffect(() => {
        const handleCsvUpload = () => {
            setReport('');
            setInsight('');
            toast.success('New data detected. Please generate a fresh report.', { icon: '🔄' });
        };
        window.addEventListener('csv-uploaded', handleCsvUpload);
        return () => window.removeEventListener('csv-uploaded', handleCsvUpload);
    }, []);

    const handleStream = () => {
        setReport('');
        setStreaming(true);
        const es = streamAnalysis();
        
        es.onmessage = (e) => {
            if (e.data === '[DONE]') {
                es.close();
                setStreaming(false);
                return;
            }
            try {
                const { text } = JSON.parse(e.data);
                setReport(prev => prev + text);
            } catch {}
        };
        
        es.onerror = () => {
            es.close();
            setStreaming(false);
            if (report.length === 0) {
               toast.error('Analysis failed. Please try again.');
            }
        };
    };

    const handleInsight = async (type: 'low' | 'dead') => {
        setInsight('');
        setInsightLoading(true);
        try {
            const fn = type === 'low' ? getLowStockInsight : getDeadStockInsight;
            const res = await fn();
            setInsight(res.data.insight);
        } catch {
            toast.error('Failed to load insight');
        } finally {
            setInsightLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg ring-1 ring-white/20">
                    <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">AI Warehouse Analysis</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Personalised report using your actual stock data
                    </p>
                </div>
            </div>

            <button 
                onClick={handleStream} 
                disabled={streaming}
                className="w-full flex justify-center items-center gap-2 bg-[rgb(var(--accent-primary))] text-white rounded-xl py-4 font-medium text-lg shadow-md hover:bg-[rgb(var(--accent-primary))]/90 disabled:opacity-50 transition-colors"
            >
                <Sparkles className="w-5 h-5" />
                {streaming ? 'Generating...' : 'Generate Full Data Report'}
            </button>

            {report && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200 shadow-sm relative">
                    {report}
                    {streaming && <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-[rgb(var(--accent-primary))]"></span>}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button 
                    onClick={() => handleInsight('low')} 
                    disabled={insightLoading}
                    className="flex-1 flex justify-center items-center gap-2 border border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800/30 rounded-xl py-3 text-sm font-medium hover:bg-orange-100 disabled:opacity-50 transition-colors"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Low Stock Details
                </button>
                <button 
                    onClick={() => handleInsight('dead')} 
                    disabled={insightLoading}
                    className="flex-1 flex justify-center items-center gap-2 border border-gray-200 text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                    <TrendingDown className="w-4 h-4" />
                    Dead Stock Details
                </button>
            </div>

            {insightLoading && <p className="text-sm text-[rgb(var(--accent-primary))] text-center animate-pulse py-4 font-medium">Analyzing stock patterns...</p>}
            
            {insight && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-6 text-sm leading-relaxed text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-300">AI Deep Dive</h3>
                    </div>
                    {insight}
                </motion.div>
            )}
        </motion.div>
    );
}
