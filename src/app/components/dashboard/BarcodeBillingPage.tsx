import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ScanBarcode,
    Trash2,
    ShoppingCart,
    Plus,
    Minus,
    CheckCircle,
    AlertCircle,
    Camera,
    Keyboard,
    Loader2,
    Receipt,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductByBarcode, checkoutCart } from '../../services/barcode';
import { recordSale } from '../../services/inventory';
import { useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
    product_id: string;
    sku: string;
    name: string;
    barcode: string;
    price: number;
    stock: number;
    quantity: number;
    category: string;
}

// ─── EAN-13 validator ────────────────────────────────────────────────────────

function isValidEAN13(code: string): boolean {
    if (!/^\d{13}$/.test(code)) return false;
    const digits = code.split('').map(Number);
    const checksum = digits.slice(0, 12).reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 1 : 3), 0);
    return (10 - (checksum % 10)) % 10 === digits[12];
}

// ─── Input mode toggle ───────────────────────────────────────────────────────

type InputMode = 'usb' | 'manual' | 'camera';

// ─── Component ───────────────────────────────────────────────────────────────

export function BarcodeBillingPage() {
    const queryClient = useQueryClient();

    // Scanner state
    const [inputMode, setInputMode] = useState<InputMode>('usb');
    const [manualInput, setManualInput] = useState('');
    const [scanning, setScanning] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);

    // Checkout state
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkoutDone, setCheckoutDone] = useState(false);

    // USB scanner buffer (keyboard input)
    const scanBuffer = useRef('');
    const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const manualRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLVideoElement>(null);
    const cameraStream = useRef<MediaStream | null>(null);
    const barcodeDetector = useRef<any>(null);
    const cameraInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Product lookup ──────────────────────────────────────────────────────

    const lookupBarcode = useCallback(async (barcode: string) => {
        if (!isValidEAN13(barcode)) {
            setLookupError(`"${barcode}" is not a valid EAN-13 barcode.`);
            toast.error('Invalid EAN-13 barcode');
            return;
        }

        setLookupError(null);
        setLastScanned(barcode);
        setScanning(true);

        try {
            const res = await getProductByBarcode(barcode);
            const raw = res.data;
            // Normalise API shape
            const product = raw.product ?? raw.item ?? raw.data ?? raw;

            if (!product || !product.id) {
                setLookupError(`No product found for barcode ${barcode}`);
                toast.error('Product not found');
                return;
            }

            const price =
                product.selling_price ?? product.sale_price ?? product.price ?? 0;
            const stock =
                product.quantity ?? product.stock ?? product.current_stock ?? 0;

            if (stock === 0) {
                toast.error(`${product.name} is out of stock`);
                return;
            }

            setCart(prev => {
                const idx = prev.findIndex(c => c.product_id === product.id);
                if (idx !== -1) {
                    const updated = [...prev];
                    const item = updated[idx];
                    if (item.quantity >= item.stock) {
                        toast.error(`Max available stock reached for ${item.name}`);
                        return prev;
                    }
                    updated[idx] = { ...item, quantity: item.quantity + 1 };
                    return updated;
                }
                return [
                    ...prev,
                    {
                        product_id: product.id,
                        sku: product.sku ?? '',
                        name: product.name,
                        barcode,
                        price,
                        stock,
                        quantity: 1,
                        category: product.category ?? '',
                    },
                ];
            });

            toast.success(`Added: ${product.name}`);
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ?? err?.message ?? 'Lookup failed';
            setLookupError(msg);
            toast.error(msg);
        } finally {
            setScanning(false);
        }
    }, []);

    // ── USB / HID scanner (keyboard buffer) ────────────────────────────────

    useEffect(() => {
        if (inputMode !== 'usb') return;

        const onKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in manual input box
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement
            ) return;

            if (e.key === 'Enter') {
                const code = scanBuffer.current.trim();
                scanBuffer.current = '';
                if (scanTimer.current) clearTimeout(scanTimer.current);
                if (code) lookupBarcode(code);
                return;
            }

            if (e.key.length === 1) {
                scanBuffer.current += e.key;
                // Auto-flush after 50ms of silence (full barcode received)
                if (scanTimer.current) clearTimeout(scanTimer.current);
                scanTimer.current = setTimeout(() => {
                    const code = scanBuffer.current.trim();
                    scanBuffer.current = '';
                    if (code) lookupBarcode(code);
                }, 50);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            if (scanTimer.current) clearTimeout(scanTimer.current);
        };
    }, [inputMode, lookupBarcode]);

    // ── Camera scanner (BarcodeDetector API) ───────────────────────────────

    const startCamera = useCallback(async () => {
        // @ts-ignore – BarcodeDetector is not in TS lib yet
        if (!('BarcodeDetector' in window)) {
            toast.error('Camera barcode scanning is not supported in this browser. Use Chrome 88+.');
            setInputMode('usb');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            cameraStream.current = stream;
            if (cameraRef.current) {
                cameraRef.current.srcObject = stream;
                cameraRef.current.play();
            }
            // @ts-ignore
            barcodeDetector.current = new BarcodeDetector({ formats: ['ean_13'] });

            cameraInterval.current = setInterval(async () => {
                if (!cameraRef.current || !barcodeDetector.current) return;
                try {
                    const codes = await barcodeDetector.current.detect(cameraRef.current);
                    if (codes.length > 0) {
                        const barcode = codes[0].rawValue as string;
                        if (barcode !== lastScanned) {
                            lookupBarcode(barcode);
                        }
                    }
                } catch { /* frame not ready */ }
            }, 600);
        } catch {
            toast.error('Camera access denied');
            setInputMode('usb');
        }
    }, [lastScanned, lookupBarcode]);

    const stopCamera = useCallback(() => {
        if (cameraInterval.current) clearInterval(cameraInterval.current);
        if (cameraStream.current) {
            cameraStream.current.getTracks().forEach(t => t.stop());
            cameraStream.current = null;
        }
    }, []);

    useEffect(() => {
        if (inputMode === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [inputMode]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cart helpers ────────────────────────────────────────────────────────

    const updateQty = (productId: string, delta: number) => {
        setCart(prev =>
            prev
                .map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: Math.max(0, Math.min(item.stock, item.quantity + delta)) }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    const removeItem = (productId: string) =>
        setCart(prev => prev.filter(i => i.product_id !== productId));

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.18; // 18% GST placeholder
    const total = subtotal + tax;

    // ── Checkout ────────────────────────────────────────────────────────────

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setCheckingOut(true);
        try {
            await checkoutCart(
                cart.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    sale_price: i.price,
                }))
            );
            // Invalidate inventory & dashboard caches
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            window.dispatchEvent(new Event('csv-uploaded')); // reuse existing convention

            setCheckoutDone(true);
            setTimeout(() => {
                setCheckoutDone(false);
                clearCart();
                setLastScanned(null);
            }, 2500);
            toast.success('Checkout successful!');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail ?? 'Checkout failed');
        } finally {
            setCheckingOut(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ScanBarcode className="w-7 h-7 text-[rgb(var(--accent-primary))]" />
                        Barcode Billing
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Scan EAN-13 barcodes to add products to the cart
                    </p>
                </div>

                {/* Input Mode Selector */}
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    {([
                        { mode: 'usb' as InputMode,    icon: Keyboard, label: 'USB Scanner' },
                        { mode: 'manual' as InputMode, icon: ScanBarcode, label: 'Manual' },
                        { mode: 'camera' as InputMode, icon: Camera,    label: 'Camera' },
                    ] as const).map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => setInputMode(mode)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                inputMode === mode
                                    ? 'bg-white dark:bg-gray-700 text-[rgb(var(--accent-primary))] shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Scanner Panel */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Scanner Input Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6"
                    >
                        {inputMode === 'usb' && (
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                    <Keyboard className="w-10 h-10 text-[rgb(var(--accent-primary))]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">USB / HID Scanner Active</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Point your scanner at a barcode. Input is captured automatically.
                                    </p>
                                </div>
                                {scanning && (
                                    <div className="flex items-center justify-center gap-2 text-[rgb(var(--accent-primary))]">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-medium">Looking up product…</span>
                                    </div>
                                )}
                                {lastScanned && !scanning && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                        Last scanned: {lastScanned}
                                    </div>
                                )}
                            </div>
                        )}

                        {inputMode === 'manual' && (
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enter 13-digit EAN-13 barcode manually
                                </p>
                                <div className="flex gap-3">
                                    <input
                                        ref={manualRef}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={13}
                                        value={manualInput}
                                        onChange={e => setManualInput(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && manualInput.length === 13) {
                                                lookupBarcode(manualInput);
                                                setManualInput('');
                                            }
                                        }}
                                        placeholder="4006381333931"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/40 focus:border-[rgb(var(--accent-primary))]"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => {
                                            if (manualInput.length === 13) {
                                                lookupBarcode(manualInput);
                                                setManualInput('');
                                            }
                                        }}
                                        disabled={manualInput.length !== 13 || scanning}
                                        className="px-5 py-2.5 rounded-xl bg-[rgb(var(--accent-primary))] text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        {scanning
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <ScanBarcode className="w-4 h-4" />
                                        }
                                        Add
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className={`font-mono ${manualInput.length === 13 ? 'text-green-500' : ''}`}>
                                        {manualInput.length}/13
                                    </span>
                                    {manualInput.length === 13 && isValidEAN13(manualInput) && (
                                        <span className="text-green-500 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Valid EAN-13
                                        </span>
                                    )}
                                    {manualInput.length === 13 && !isValidEAN13(manualInput) && (
                                        <span className="text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Invalid checksum
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {inputMode === 'camera' && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Camera Scanner — point at an EAN-13 barcode
                                </p>
                                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                                    <video
                                        ref={cameraRef}
                                        className="w-full h-full object-cover"
                                        playsInline
                                        muted
                                    />
                                    {/* Crosshair overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-48 h-20 border-2 border-[rgb(var(--accent-primary))] rounded-lg opacity-70" />
                                    </div>
                                    {scanning && (
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Looking up…
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 text-center">
                                    Requires Chrome 88+ with BarcodeDetector API
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        <AnimatePresence>
                            {lookupError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-xl p-3"
                                >
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{lookupError}</span>
                                    <button onClick={() => setLookupError(null)} className="ml-auto">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Scanned Items Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                                Cart
                                {cart.length > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] rounded-full">
                                        {cart.length}
                                    </span>
                                )}
                            </h2>
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                                </button>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No items scanned yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left font-medium">Product</th>
                                            <th className="px-4 py-3 text-right font-medium">Price</th>
                                            <th className="px-4 py-3 text-center font-medium">Qty</th>
                                            <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        <AnimatePresence initial={false}>
                                            {cart.map(item => (
                                                <motion.tr
                                                    key={item.product_id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono">{item.barcode}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                        ₹{item.price.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => updateQty(item.product_id, -1)}
                                                                className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQty(item.product_id, 1)}
                                                                disabled={item.quantity >= item.stock}
                                                                className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-40"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => removeItem(item.product_id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right: Bill Summary */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="sticky top-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        {/* Bill Header */}
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">Bill Summary</h2>
                        </div>

                        {/* Line items summary */}
                        <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                            {cart.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                                    Cart is empty
                                </p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product_id} className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[160px]">
                                            {item.name}
                                            <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white shrink-0">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals */}
                        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/30 space-y-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>GST (18%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <div className="px-5 py-4">
                            <AnimatePresence mode="wait">
                                {checkoutDone ? (
                                    <motion.div
                                        key="done"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Checkout Successful!
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="btn"
                                        onClick={handleCheckout}
                                        disabled={cart.length === 0 || checkingOut}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full py-3 rounded-xl bg-[rgb(var(--accent-primary))] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
                                    >
                                        {checkingOut ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                                        ) : (
                                            <><ShoppingCart className="w-4 h-4" /> Checkout · ₹{total.toFixed(2)}</>
                                        )}
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {cart.length > 0 && !checkoutDone && (
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    {cart.reduce((s, i) => s + i.quantity, 0)} item(s) · stock updated on checkout
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
