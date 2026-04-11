import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { UploadCloud, CheckCircle, AlertCircle, X, Loader2, DownloadCloud, ChevronDown, ChevronRight } from 'lucide-react';
import { db, InventoryItem, SalesRecord } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Button } from '../ui/button';
import { uploadCSV } from '../../services/inventory';
import { triggerScan } from '../../services/notificationService';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

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
    
    // New states
    const [previewColumns, setPreviewColumns] = useState<string[]>([]);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [isColsExpanded, setIsColsExpanded] = useState(false);

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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const handleFile = (selectedFile: File) => {
        const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.type.includes('excel') || selectedFile.type.includes('spreadsheetml');
        const isCsv = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv');
        if (!isExcel && !isCsv) {
            setError('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File too large. Maximum size is 5 MB.');
            return;
        }
        setError(null);
        setFile(selectedFile);
        
        // Change 6 - Read the first line inside client side
        setPreviewColumns([]);
        if (isCsv) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                if (text) {
                    const firstLine = text.split('\n')[0];
                    const cols = firstLine.split(',').map(c => c.trim().replace(/^"|"$/g, '')).filter(Boolean);
                    setPreviewColumns(cols);
                }
            };
            reader.readAsText(selectedFile.slice(0, 4096));
        } else if (isExcel) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const headers = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 })[0] || [];
                    setPreviewColumns(headers);
                } catch(err) {
                    console.error("Preview failed", err);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/upload/template', { responseType: 'blob' });
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'inventory_template.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            toast.error('Error downloading template');
        }
    };

    const processData = async () => {
        if (!file || !user) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Authentication required. Please log in again.');
            toast.error('Please log in again to upload files.');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadResult(null);

        try {
            const response = await uploadCSV(file);
            const data = response.data || {};
            const count = data.imported_count || data.products_imported || data.count || data.total || 0;
            
            setUploadResult({
                type: 'success',
                imported: count,
                skipped: data.skipped_count || data.skipped || 0,
                skippedReasons: data.skipped_reasons || [],
                mapping: data.mapping || {},
                warnings: data.warnings || [],
            });

            toast.success(`${count} products imported successfully`);
            setSuccess(true);
            window.dispatchEvent(new CustomEvent('csv-uploaded'));
            refreshData().catch(() => {});
            
            // Fire and forget scan
            const token = localStorage.getItem('access_token');
            if (token) triggerScan(token).catch(console.error);
            
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data || {};

            if (status === 422 || status === 400 || (data && (data.missingColumns || data.required_columns || data.missing_columns))) {
                setUploadResult({
                    type: 'error',
                    missingColumns: data.missing_columns || data.missingColumns || data.required_columns || ['product name', 'SKU', 'stock quantity'],
                    actualHeaders: data.actual_headers || data.actualHeaders || data.headers || previewColumns,
                    errorMsg: data.detail || data.error || 'Columns Not Recognized',
                });
            } else {
                let errorMsg = 'Error processing file.';
                if (!err.response && err.message) {
                    errorMsg = 'Network error. Please check your internet connection and try again.';
                } else if (status === 401 || status === 403) {
                    errorMsg = 'Authentication failed. Please log in again and retry.';
                } else if (status === 413) {
                    errorMsg = 'File is too large for the server. Please reduce the file size.';
                } else if (status && status >= 500) {
                    errorMsg = 'Server error. The backend may be restarting — please try again in a minute.';
                } else {
                    errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || errorMsg;
                }
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg my-8 relative overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Your Inventory CSV</h2>
                        <p className="text-sm text-gray-500">
                            Upload any CSV file — we automatically detect your columns. Works with Excel exports, Tally exports, Vyapar exports, and custom formats.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-4 shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {!uploadResult ? (
                        <>
                            <div className="mb-6 flex justify-between items-center">
                                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-sm border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30">
                                    <DownloadCloud className="w-4 h-4 mr-2" /> Download Sample Template
                                </Button>
                            </div>
                            
                            <div className="mb-6">
                                <button 
                                    onClick={() => setIsColsExpanded(!isColsExpanded)} 
                                    className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                >
                                    {isColsExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                                    Accepted column names
                                </button>
                                
                                {isColsExpanded && (
                                    <div className="mt-3 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 border border-gray-200 dark:border-gray-600 rounded-lg overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                                    <th className="py-2 pr-4 font-semibold text-gray-900 dark:text-white">Field</th>
                                                    <th className="py-2 font-semibold text-gray-900 dark:text-white">Example column names we recognize</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
                                                <tr><td className="py-2 pr-4 font-medium">Product Name</td><td className="py-2">name, product_name, item, description, title</td></tr>
                                                <tr><td className="py-2 pr-4 font-medium">SKU / Code</td><td className="py-2">sku, product_code, item_code, barcode, code</td></tr>
                                                <tr><td className="py-2 pr-4 font-medium">Category</td><td className="py-2">category, type, group, department</td></tr>
                                                <tr><td className="py-2 pr-4 font-medium">Price</td><td className="py-2">unit_price, price, rate, mrp, cost, selling_price</td></tr>
                                                <tr><td className="py-2 pr-4 font-medium">Stock Quantity</td><td className="py-2">current_stock, stock, quantity, qty, available</td></tr>
                                                <tr><td className="py-2 pr-4 font-medium">Reorder Point</td><td className="py-2">reorder_point, min_stock, minimum, reorder_level</td></tr>
                                                <tr><td className="py-2 pr-4 font-medium">Reorder Qty</td><td className="py-2">reorder_quantity, reorder_qty, order_qty</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'
                                    } ${file ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="csv-upload"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-sm">{file.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                        
                                        {previewColumns.length > 0 && (
                                            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 w-full text-left">
                                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Detected columns in your file:</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate break-all">
                                                    {previewColumns.join(', ')}
                                                </p>
                                            </div>
                                        )}

                                        <label htmlFor="csv-upload" className="mt-4 text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 cursor-pointer">
                                            Choose a different file
                                        </label>
                                    </div>
                                ) : (
                                    <label htmlFor="csv-upload" className="flex flex-col items-center cursor-pointer">
                                        <div className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full mb-4 group-hover:scale-105 transition-transform">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <p className="text-[15px] font-medium text-gray-900 dark:text-white mb-2">
                                            Drag & drop your CSV here, or click to browse
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Supports any column names • Excel & Tally exports welcome
                                        </p>
                                    </label>
                                )}
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start">
                                    <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
                                <Button
                                    onClick={processData}
                                    disabled={!file || isUploading || !!error}
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                                >
                                    {isUploading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing</>
                                    ) : (
                                        'Import Data'
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-300">
                            {uploadResult.type === 'success' ? (
                                <div>
                                    <div className="flex items-center text-green-600 dark:text-green-400 mb-4">
                                        <CheckCircle className="w-8 h-8 mr-3" />
                                        <h3 className="text-xl font-bold">Import Complete</h3>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-6 space-y-3">
                                        <p className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                            Imported: <span className="font-bold ml-1">{uploadResult.imported}</span> products
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                                            <span className={`w-2 h-2 rounded-full mr-2 ${uploadResult.skipped > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            Skipped: <span className="font-bold ml-1">{uploadResult.skipped}</span> rows
                                        </p>
                                        
                                        {uploadResult.skippedReasons?.length > 0 && (
                                            <ul className="text-xs text-green-600 dark:text-green-400 ml-4 list-disc pl-2 space-y-1 mt-1">
                                                {uploadResult.skippedReasons.map((reason: string, i: number) => (
                                                    <li key={i}>{reason}</li>
                                                ))}
                                            </ul>
                                        )}
                                        
                                        {Object.keys(uploadResult.mapping || {}).length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Column mapping detected:</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    {Object.entries(uploadResult.mapping).slice(0, 8).map(([original, mapped]: any, i) => (
                                                        <div key={i} className="flex truncate text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-1.5 rounded border border-gray-100 dark:border-gray-700">
                                                            "<span className="truncate max-w-[80px]" title={original}>{original}</span>"
                                                            <span className="mx-1">→</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{mapped}</span>
                                                        </div>
                                                    ))}
                                                    {Object.keys(uploadResult.mapping).length > 8 && (
                                                        <div className="text-gray-500 italic p-1.5">...and more</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {uploadResult.warnings?.length > 0 && (
                                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <p className="text-sm font-semibold text-green-800 dark:text-green-400 mb-1 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    Warnings:
                                                </p>
                                                <ul className="text-xs text-green-700 dark:text-green-500 list-disc pl-5 space-y-1 max-h-20 overflow-y-auto">
                                                    {uploadResult.warnings.map((warn: string, i: number) => (
                                                        <li key={i}>{warn}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 justify-end mt-6">
                                        <Button variant="outline" onClick={() => { setUploadResult(null); setFile(null); }}>Upload Another</Button>
                                        <Button onClick={() => window.location.href = '/dashboard/inventory'} className="bg-green-600 hover:bg-green-700 text-white">
                                            View Inventory
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
                                        <AlertCircle className="w-8 h-8 mr-3" />
                                        <h3 className="text-xl font-bold">Import Failed — Columns Not Recognized</h3>
                                    </div>
                                    
                                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-5 mb-6 space-y-4">
                                        <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                                            {uploadResult.errorMsg}
                                        </p>

                                        {uploadResult.missingColumns && uploadResult.missingColumns.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Required columns missing:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {uploadResult.missingColumns.map((col: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                                                            {col}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {uploadResult.actualHeaders && uploadResult.actualHeaders.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Your CSV had these headers:</p>
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 break-all h-20 overflow-y-auto">
                                                    {uploadResult.actualHeaders.join(', ')}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                                                Download our template to see the correct format:
                                            </p>
                                            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-xs bg-white dark:bg-gray-800">
                                                <DownloadCloud className="w-4 h-4 mr-2" /> Download Template
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button onClick={() => setUploadResult(null)} className="w-full sm:w-auto">
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
