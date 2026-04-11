import { useState } from 'react';
import { streamAnalysis, getLowStockInsight, getDeadStockInsight } from '../../services/ai';
import toast from 'react-hot-toast';

export function AiReportPage() {
    const [report, setReport] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [insight, setInsight] = useState('');
    const [insightTitle, setInsightTitle] = useState('');
    const [insightLoading, setInsightLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = () => {
        setReport('');
        setError('');
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

        es.onerror = (err) => {
            console.error('Stream error:', err);
            es.close();
            setStreaming(false);
            setError('AI analysis failed. Make sure the backend is running and you have uploaded a CSV first.');
            toast.error('AI analysis failed');
        };
    };

    const handleInsight = async (type: 'low' | 'dead') => {
        setInsight('');
        setInsightLoading(true);
        setInsightTitle(type === 'low' ? 'Low Stock Details' : 'Dead Stock Details');
        try {
            const fn = type === 'low' ? getLowStockInsight : getDeadStockInsight;
            const res = await fn();
            setInsight(res.data.insight);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load insight. Check backend connection.');
        } finally {
            setInsightLoading(false);
        }
    };

    return (
        <div className='max-w-3xl mx-auto p-6'>
            <div className='flex items-center gap-3 mb-2'>
                <div className='w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-sm'>
                    <span className='text-white text-lg'> ✦ </span>
                </div>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-900 dark:text-white'>AI Warehouse Analysis</h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Personalised report using your actual stock data</p>
                </div>
            </div>

            <span className='block h-6' />

            {/* Generate button */}
            <button
                onClick={handleGenerate}
                disabled={streaming}
                className='w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl py-3.5 font-medium text-sm mb-4 flex items-center justify-center gap-2 transition-colors shadow-sm'
            >
                <span> ✦ </span>
                {streaming ? 'Generating analysis...' : 'Generate Full Data Report'}
            </button>

            {/* Error message */}
            {error && (
                <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 mb-4'>
                    <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
                </div>
            )}

            {/* Streamed report */}
            {(report || streaming) && (
                <div className='bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-wrap shadow-sm'>
                    {report}
                    {streaming && <span className='animate-pulse text-green-500 dark:text-green-400 font-bold'>|</span>}
                </div>
            )}

            {/* Insight buttons */}
            <div className='flex gap-3 mb-4'>
                <button onClick={() => handleInsight('low')} disabled={insightLoading} className='flex-1 border border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl py-2.5 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2'>
                    <span> ⚠ </span> Low Stock Details
                </button>
                <button onClick={() => handleInsight('dead')} disabled={insightLoading} className='flex-1 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800/60 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2'>
                    <span> ↘ </span> Dead Stock Stock Details
                </button>
            </div>

            {insightLoading && (
                <p className='text-sm text-gray-500 dark:text-gray-400 text-center py-4 animate-pulse'>
                    Loading insight...
                </p>
            )}
            
            {insight && (
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-5'>
                    <h3 className='text-sm font-medium text-gray-300 mb-3'>{insightTitle}</h3>
                    <p className='text-sm leading-relaxed text-gray-200 whitespace-pre-wrap'>
                        {insight}
                    </p>
                </div>
            )}
        </div>
    );
}
