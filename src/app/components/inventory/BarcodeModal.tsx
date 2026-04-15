import { useState, useCallback } from 'react';
import { X, RefreshCw, Pencil, Check, Loader2, ScanBarcode } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { BarcodeDisplay } from './BarcodeDisplay';
import { generateBarcode, saveManualBarcode } from '../../services/barcode';

interface BarcodeModalProps {
    item: { id: string; name: string; sku: string; barcode?: string | null };
    onClose: () => void;
}

export function BarcodeModal({ item, onClose }: BarcodeModalProps) {
    const queryClient = useQueryClient();
    const [barcode, setBarcode] = useState<string | null>(item.barcode ?? null);
    const [generating, setGenerating] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [saving, setSaving] = useState(false);

    const handleGenerate = useCallback(async () => {
        setGenerating(true);
        try {
            const res = await generateBarcode(item.id);
            const raw = res.data;
            const newBarcode =
                raw?.barcode ?? raw?.barcode_number ?? raw?.code ?? raw?.ean ?? null;
            if (newBarcode) {
                setBarcode(String(newBarcode));
                queryClient.invalidateQueries({ queryKey: ['inventory'] });
                toast.success('Barcode generated successfully');
            } else {
                toast.error('Barcode generated but could not read value from response');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.detail ?? 'Failed to generate barcode');
        } finally {
            setGenerating(false);
        }
    }, [item.id, queryClient]);

    const handleSaveManual = useCallback(async () => {
        if (manualInput.length !== 13) return;
        setSaving(true);
        try {
            await saveManualBarcode(item.id, manualInput);
            setBarcode(manualInput);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setShowManual(false);
            toast.success('Barcode saved successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail ?? 'Failed to save barcode');
        } finally {
            setSaving(false);
        }
    }, [item.id, manualInput, queryClient]);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <ScanBarcode className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                            Product Barcode
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>
                    </div>

                    {barcode ? (
                        <BarcodeDisplay barcode={barcode} productName={item.name} sku={item.sku} />
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600 p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <ScanBarcode className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    No barcode assigned
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Generate an EAN-13 barcode or enter one manually
                                </p>
                            </div>

                            {!showManual ? (
                                <div className="flex gap-2 justify-center flex-wrap">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 font-medium"
                                    >
                                        {generating
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <RefreshCw className="w-3.5 h-3.5" />}
                                        Generate Barcode
                                    </button>
                                    <button
                                        onClick={() => setShowManual(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Enter Manually
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={13}
                                        value={manualInput}
                                        onChange={e => setManualInput(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 13-digit barcode"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/40 focus:border-[rgb(var(--accent-primary))]"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-400 text-left">
                                        {manualInput.length}/13 digits
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setShowManual(false); setManualInput(''); }}
                                            className="flex-1 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveManual}
                                            disabled={manualInput.length !== 13 || saving}
                                            className="flex-1 py-2 bg-[rgb(var(--accent-primary))] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 font-medium flex items-center justify-center gap-1.5"
                                        >
                                            {saving
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <Check className="w-3.5 h-3.5" />}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
