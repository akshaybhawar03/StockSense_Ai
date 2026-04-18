import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    X, Camera, Upload, FileUp, Loader2, CheckCircle2, AlertCircle,
    Sparkles, Plus, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { scanBill, confirmScanBill, ScannedProduct } from '../../services/scanBill';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Screen = 'upload' | 'scanning' | 'review' | 'success';

const UNIT_OPTIONS = ['kg', 'g', 'litre', 'ml', 'pcs', 'box', 'bag', 'bundle', 'dozen'];
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MIN_SIZE = 50 * 1024;

interface ReviewProduct extends ScannedProduct {
    _id: string;
}

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ScanBillModal({ isOpen, onClose }: Props) {
    const navigate = useNavigate();
    const [screen, setScreen] = useState<Screen>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [products, setProducts] = useState<ReviewProduct[]>([]);
    const [supplier, setSupplier] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const autoCloseRef = useRef<number | null>(null);

    const reset = useCallback(() => {
        setScreen('upload');
        setSelectedFile(null);
        setProducts([]);
        setSupplier('');
        setError(null);
        setProgress(0);
        setIsDragging(false);
    }, []);

    const handleClose = useCallback(() => {
        if (autoCloseRef.current) {
            window.clearTimeout(autoCloseRef.current);
            autoCloseRef.current = null;
        }
        reset();
        onClose();
    }, [onClose, reset]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, handleClose]);

    // Progress animation while scanning
    useEffect(() => {
        if (screen !== 'scanning') return;
        setProgress(0);
        const id = window.setInterval(() => {
            setProgress(p => (p >= 95 ? p : p + Math.max(1, Math.round((95 - p) / 18))));
        }, 200);
        return () => window.clearInterval(id);
    }, [screen]);

    const handleFileSelected = (file: File) => {
        if (file.size < MIN_SIZE) {
            setError('Photo is too small or blurry. Please take a clearer photo in good lighting.');
            return;
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Only JPG, PNG, or PDF files are supported.');
            return;
        }
        setError(null);
        setSelectedFile(file);
    };

    const onCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFileSelected(f);
        e.target.value = '';
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFileSelected(f);
        e.target.value = '';
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFileSelected(f);
    };

    const startScan = async () => {
        if (!selectedFile) return;
        setScreen('scanning');
        setError(null);
        try {
            const data = await scanBill(selectedFile);
            const items: ScannedProduct[] = Array.isArray(data?.products) ? data.products : [];
            if (items.length === 0) {
                setProgress(0);
                setScreen('upload');
                setError('No products could be extracted from this bill. Try a clearer photo.');
                return;
            }
            setProducts(items.map(p => ({
                _id: uid(),
                name: p.name ?? '',
                quantity: Number(p.quantity) || 0,
                unit: p.unit || 'pcs',
                rate: Number(p.rate) || 0,
            })));
            if (data?.supplier) setSupplier(data.supplier);
            setProgress(100);
            setScreen('review');
        } catch (err: any) {
            setProgress(0);
            setScreen('upload');
            const msg = err?.response?.data?.detail || err?.message || 'Failed to scan bill. Please try again.';
            setError(msg);
            toast.error(msg);
        }
    };

    const updateProduct = (id: string, patch: Partial<ScannedProduct>) => {
        setProducts(prev => prev.map(p => (p._id === id ? { ...p, ...patch } : p)));
    };
    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p._id !== id));
    };
    const addProduct = () => {
        setProducts(prev => [
            ...prev,
            { _id: uid(), name: '', quantity: 1, unit: 'pcs', rate: 0 },
        ]);
    };

    const confirmAdd = async () => {
        const payload: ScannedProduct[] = products.map(({ _id: _ignored, ...rest }) => rest);
        if (payload.length === 0) {
            toast.error('Add at least one product.');
            return;
        }
        try {
            await confirmScanBill(payload, supplier || undefined);
            window.dispatchEvent(new Event('csv-uploaded'));
            toast.success(`${payload.length} products added to inventory`);
            setScreen('success');
            autoCloseRef.current = window.setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (err: any) {
            const msg = err?.response?.data?.detail || err?.message || 'Failed to add products to inventory.';
            toast.error(msg);
        }
    };

    if (!isOpen) return null;

    const totalAmount = products.reduce((s, p) => s + (Number(p.quantity) || 0) * (Number(p.rate) || 0), 0);

    const stageLabel =
        progress < 33 ? 'Reading image...' :
        progress < 66 ? 'Running AI analysis...' :
        'Extracting products...';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-green-600" />
                            Scan Purchase Bill
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Take photo in good lighting for best results
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                    {screen === 'upload' && (
                        <UploadScreen
                            selectedFile={selectedFile}
                            error={error}
                            isDragging={isDragging}
                            onCameraClick={() => cameraInputRef.current?.click()}
                            onFileClick={() => fileInputRef.current?.click()}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onScan={startScan}
                            onCancel={handleClose}
                        />
                    )}

                    {screen === 'scanning' && (
                        <ScanningScreen progress={progress} stageLabel={stageLabel} />
                    )}

                    {screen === 'review' && (
                        <ReviewScreen
                            products={products}
                            supplier={supplier}
                            totalAmount={totalAmount}
                            onChangeSupplier={setSupplier}
                            onUpdate={updateProduct}
                            onRemove={removeProduct}
                            onAdd={addProduct}
                            onConfirm={confirmAdd}
                            onBack={() => { setScreen('upload'); setProducts([]); }}
                        />
                    )}

                    {screen === 'success' && (
                        <SuccessScreen
                            products={products}
                            supplier={supplier}
                            onScanAnother={() => reset()}
                            onGoToInventory={() => { handleClose(); navigate('/dashboard/inventory'); }}
                        />
                    )}
                </div>

                {/* Hidden inputs (shared across screens) */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={onCameraChange}
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={onFileChange}
                />
            </div>
        </div>
    );
}

/* ───────── SCREEN 1 ───────── */
function UploadScreen(props: {
    selectedFile: File | null;
    error: string | null;
    isDragging: boolean;
    onCameraClick: () => void;
    onFileClick: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onScan: () => void;
    onCancel: () => void;
}) {
    const { selectedFile, error, isDragging, onCameraClick, onFileClick,
        onDragOver, onDragLeave, onDrop, onScan, onCancel } = props;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    onClick={onCameraClick}
                    className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                >
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                        <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Take Photo</span>
                    <span className="text-xs text-gray-500">Use back camera</span>
                </button>

                <button
                    onClick={onFileClick}
                    className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                >
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                        <FileUp className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Upload from Files</span>
                    <span className="text-xs text-gray-500">JPG, PNG, or PDF</span>
                </button>
            </div>

            {/* Drop zone: hidden on mobile */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`hidden md:flex mt-4 flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl transition ${
                    isDragging
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                }`}
            >
                <Upload className="w-6 h-6 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Drag & drop your bill here
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, PDF</p>
            </div>

            {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button
                    onClick={onScan}
                    disabled={!selectedFile}
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Scan Bill
                </Button>
            </div>
        </div>
    );
}

/* ───────── SCREEN 2 ───────── */
function ScanningScreen({ progress, stageLabel }: { progress: number; stageLabel: string }) {
    return (
        <div className="py-10 flex flex-col items-center text-center">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{stageLabel}</p>
            <p className="text-sm text-gray-500 mb-6">AI is reading your bill…</p>
            <div className="w-full max-w-md h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">{progress}%</p>
        </div>
    );
}

/* ───────── SCREEN 3 ───────── */
function ReviewScreen(props: {
    products: ReviewProduct[];
    supplier: string;
    totalAmount: number;
    onChangeSupplier: (v: string) => void;
    onUpdate: (id: string, patch: Partial<ScannedProduct>) => void;
    onRemove: (id: string) => void;
    onAdd: () => void;
    onConfirm: () => void;
    onBack: () => void;
}) {
    const { products, supplier, totalAmount, onChangeSupplier,
        onUpdate, onRemove, onAdd, onConfirm, onBack } = props;

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Review Extracted Products
                </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                {products.length} products found — review and confirm
            </p>

            <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Supplier (optional)
                </label>
                <input
                    type="text"
                    value={supplier}
                    onChange={(e) => onChangeSupplier(e.target.value)}
                    placeholder="e.g. ABC Traders"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="space-y-3">
                {products.map((p) => {
                    const lineTotal = (Number(p.quantity) || 0) * (Number(p.rate) || 0);
                    return (
                        <div
                            key={p._id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900/30 relative"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 rounded-full">
                                    AI DETECTED
                                </span>
                                <button
                                    onClick={() => onRemove(p._id)}
                                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                                    aria-label="Remove product"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Product Name</label>
                                    <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => onUpdate(p._id, { name: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Quantity</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={p.quantity}
                                        onChange={(e) => onUpdate(p._id, { quantity: Number(e.target.value) })}
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Unit</label>
                                    <select
                                        value={p.unit}
                                        onChange={(e) => onUpdate(p._id, { unit: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Rate (₹)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={p.rate}
                                        onChange={(e) => onUpdate(p._id, { rate: Number(e.target.value) })}
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total</label>
                                    <div className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white">
                                        ₹{lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={onAdd}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Product
            </button>

            <div className="mt-5 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Amount</span>
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={onBack}>Edit / Go Back</Button>
                <Button
                    onClick={onConfirm}
                    disabled={products.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    Add all to inventory
                </Button>
            </div>
        </div>
    );
}

/* ───────── SCREEN 4 ───────── */
function SuccessScreen(props: {
    products: ReviewProduct[];
    supplier: string;
    onScanAnother: () => void;
    onGoToInventory: () => void;
}) {
    const { products, supplier, onScanAnother, onGoToInventory } = props;
    return (
        <div className="py-6 flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 mb-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Inventory Updated!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                {products.length} products added{supplier ? ` from ${supplier} bill` : ''}
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 max-h-64 overflow-y-auto">
                {products.map((p) => (
                    <div
                        key={p._id}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-left bg-white dark:bg-gray-900/30"
                    >
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name || 'Unnamed'}</p>
                        <p className="text-xs text-gray-500">{p.quantity} {p.unit}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button variant="outline" onClick={onScanAnother}>Scan Another Bill</Button>
                <Button onClick={onGoToInventory} className="bg-green-600 hover:bg-green-700 text-white">
                    Go to Inventory
                </Button>
            </div>
        </div>
    );
}
