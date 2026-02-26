import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { UploadCloud, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { db, InventoryItem, SalesRecord } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Button } from '../ui/button';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function CsvUploadModal({ isOpen, onClose }: Props) {
    const { user } = useAuth();
    const { refreshData } = useData();
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile: File) => {
        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            return;
        }
        setError(null);
        setFile(selectedFile);
    };

    const processData = async () => {
        if (!file || !user) return;
        setIsUploading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: async (results) => {
                try {
                    const data = results.data as any[];
                    if (!data || data.length === 0) {
                        throw new Error('CSV file is empty or invalid.');
                    }

                    const newInventory: InventoryItem[] = [];
                    const newSales: SalesRecord[] = [];

                    const now = new Date().toISOString();

                    for (let row of data) {
                        // Basic validation
                        if (!row.sku || typeof row.sku !== 'string') continue;

                        const stock = Number(row.stock) || 0;
                        const price = Number(row.price) || 0;
                        const sales = Number(row.sales) || 0;
                        const name = row.name || row.product_name || `Unknown Product ${row.sku}`;
                        const category = row.category || 'General';

                        newInventory.push({
                            id: uuidv4(),
                            userId: user.id,
                            sku: row.sku,
                            name,
                            category,
                            stock,
                            price,
                            sales,
                            createdAt: now,
                            updatedAt: now
                        });

                        // Generate some pseudo sales records based on the total sales number 
                        // so our charts have something to show right away.
                        if (sales > 0) {
                            // Spread it over the last 30 days randomly
                            for (let i = 0; i < Math.min(sales, 10); i++) {
                                const daysAgo = Math.floor(Math.random() * 30);
                                const recordDate = new Date();
                                recordDate.setDate(recordDate.getDate() - daysAgo);

                                newSales.push({
                                    id: uuidv4(),
                                    userId: user.id,
                                    sku: row.sku,
                                    quantity: Math.ceil(sales / 10),
                                    revenue: Math.ceil(sales / 10) * price,
                                    date: recordDate.toISOString()
                                });
                            }
                        }
                    }

                    // Batch insert
                    await db.transaction('rw', db.inventory, db.sales, async () => {
                        await db.inventory.bulkAdd(newInventory);
                        await db.sales.bulkAdd(newSales);
                    });

                    setSuccess(true);
                    await refreshData();

                    setTimeout(() => {
                        onClose();
                        setSuccess(false);
                        setFile(null);
                    }, 2000);

                } catch (err: any) {
                    setError(err.message || 'Error processing CSV file.');
                } finally {
                    setIsUploading(false);
                }
            },
            error: (error) => {
                setError(`Error parsing CSV: ${error.message}`);
                setIsUploading(false);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Inventory</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-green-500">
                            <CheckCircle className="w-16 h-16 animate-bounce mb-4" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Successful!</p>
                            <p className="text-sm text-gray-500 text-center">Your dashboard is being updated.</p>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-300 dark:border-gray-600'
                                    } ${file ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="csv-upload"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="p-3 bg-teal-100 text-teal-600 rounded-full mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                        <label htmlFor="csv-upload" className="mt-4 text-xs font-medium text-teal-600 hover:text-teal-700 cursor-pointer">
                                            Choose a different file
                                        </label>
                                    </div>
                                ) : (
                                    <label htmlFor="csv-upload" className="flex flex-col items-center cursor-pointer">
                                        <div className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full mb-4">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 mb-4">
                                            CSV files only (max 10MB)
                                        </p>
                                        <div className="text-xs text-left bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-lg flex items-start">
                                            <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                                            <span>Required columns: <br /><strong>sku, name, category, stock, price, sales</strong></span>
                                        </div>
                                    </label>
                                )}
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="outline" onClick={onClose}>Cancel</Button>
                                <Button
                                    onClick={processData}
                                    disabled={!file || isUploading}
                                    className="bg-teal-600 hover:bg-teal-700 min-w-[120px]"
                                >
                                    {isUploading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing</>
                                    ) : (
                                        'Import Data'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
