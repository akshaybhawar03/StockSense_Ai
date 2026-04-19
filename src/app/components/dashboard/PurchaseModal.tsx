import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, CheckCircle, Search, ChevronDown, ShoppingBag, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInventory } from '../../services/inventory';
import { createPurchase } from '../../services/sales';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

function formatINR(val: number) {
    return '₹' + Number(val).toLocaleString('en-IN', {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
}

function stockBadge(qty: number) {
    if (qty === 0) return { cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'Out' };
    if (qty <= 10) return { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: `${qty}` };
    return { cls: 'bg-[#00d26a]/20 text-[#00b85c] dark:bg-[#00d26a]/20 dark:text-[#00d26a]', label: `${qty}` };
}

export function PurchaseModal({ isOpen, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();

    const [productId, setProductId]         = useState('');
    const [quantity, setQuantity]           = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [supplierName, setSupplierName]   = useState('');
    const [date, setDate]                   = useState(today());
    const [errors, setErrors]               = useState<Record<string, string>>({});
    const [done, setDone]                   = useState(false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery]       = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: productsRes } = useQuery({
        queryKey: ['inventory', 'list', { page: 1, pageSize: 1000 }],
        queryFn: ({ signal }) =>
            getInventory({ page: 1, page_size: 1000 }, signal).then(r => {
                const d = r.data;
                return d.items || d.data || d.products || [];
            }),
        staleTime: 5 * 60 * 1000,
        enabled: isOpen,
    });
    const products: any[] = productsRes ?? [];
    const selectedProduct = products.find(p => p.id === productId);
    const availableStock: number = selectedProduct?.quantity ?? selectedProduct?.stock ?? selectedProduct?.current_stock ?? 0;

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Keyboard + click-outside
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isDropdownOpen) setIsDropdownOpen(false);
                else if (isOpen) handleClose();
            }
        };
        const onClickOut = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setIsDropdownOpen(false);
        };
        if (isOpen) document.addEventListener('keydown', onKey);
        if (isDropdownOpen) document.addEventListener('mousedown', onClickOut);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClickOut);
        };
    }, [isOpen, isDropdownOpen]);

    function handleClose() {
        setProductId(''); setQuantity(''); setPurchasePrice('');
        setSupplierName(''); setDate(today());
        setErrors({}); setDone(false);
        setIsDropdownOpen(false); setSearchQuery('');
        onClose();
    }

    function validate() {
        const e: Record<string, string> = {};
        if (!productId)                                    e.product       = 'Select a product';
        if (!quantity || Number(quantity) < 1)             e.quantity      = 'Minimum 1';
        if (!purchasePrice || Number(purchasePrice) <= 0)  e.purchasePrice = 'Enter a valid price';
        if (!date)                                         e.date          = 'Select a date';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    const mutation = useMutation({
        mutationFn: () => createPurchase({
            product_id: productId,
            quantity: Number(quantity),
            purchase_price: Number(purchasePrice),
            supplier_name: supplierName || undefined,
            date,
        }),
        onSuccess: () => {
            toast.success('Purchase recorded! Stock updated.');
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setDone(true);
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.detail
                || err?.response?.data?.message
                || err?.message
                || 'Failed to record purchase';
            toast.error(msg);
        },
    });

    const totalAmt = Number(quantity) > 0 && Number(purchasePrice) > 0
        ? Number(quantity) * Number(purchasePrice) : 0;

    if (!isOpen) return null;

    // ── Success screen ────────────────────────────────────────────────────────
    if (done) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 rounded-full bg-[#00d26a]/20 dark:bg-[#00d26a]/20 flex items-center justify-center">
                    <CheckCircle className="w-9 h-9 text-[#00d26a]" />
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Purchase Recorded!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stock has been updated successfully.</p>
                </div>
                <button
                    onClick={() => { onSuccess(); handleClose(); }}
                    className="w-full h-11 rounded-xl bg-[#00d26a] hover:bg-[#00b85c] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    Done
                </button>
            </div>
        </div>
    );

    // ── Main form ─────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* ── Green header ────────────────────────────────────── */}
                <div className="bg-gradient-to-r bg-[#4be277] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white leading-tight">Record New Purchase</h2>
                                <p className="text-xs text-white/80 mt-0.5">Update stock by recording a purchase</p>
                            </div>
                        </div>
                        <button onClick={handleClose}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* ── Form body ───────────────────────────────────────── */}
                <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">

                    {/* Product picker */}
                    <div ref={dropdownRef} className="relative">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Product <span className="text-red-400 normal-case tracking-normal">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(v => !v)}
                            className={`w-full h-11 px-3.5 flex items-center justify-between rounded-xl border text-sm transition-all
                                ${errors.product ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-[#00d26a]'}
                                ${isDropdownOpen ? 'border-[#00d26a] ring-2 ring-[#00d26a]/20' : ''}
                                text-gray-700 dark:text-gray-200`}
                        >
                            <span className={selectedProduct ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                                {selectedProduct ? selectedProduct.name : 'Select a product…'}
                            </span>
                            <div className="flex items-center gap-2">
                                {selectedProduct && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stockBadge(availableStock).cls}`}>
                                        Stock: {availableStock}
                                    </span>
                                )}
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search by name or SKU…"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full h-8 pl-7 pr-3 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00d26a]/30"
                                        />
                                    </div>
                                </div>
                                <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                                    {filteredProducts.length === 0 ? (
                                        <li className="px-4 py-6 text-sm text-center text-gray-400">No products found</li>
                                    ) : filteredProducts.map((p: any) => {
                                        const qty = p.quantity ?? p.stock ?? p.current_stock ?? 0;
                                        const badge = stockBadge(qty);
                                        return (
                                            <li
                                                key={p.id}
                                                onClick={() => {
                                                    setProductId(p.id);
                                                    setIsDropdownOpen(false);
                                                    setSearchQuery('');
                                                    if (errors.product) setErrors(prev => ({ ...prev, product: '' }));
                                                }}
                                                className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors
                                                    ${productId === p.id ? 'bg-[#00d26a]/10 dark:bg-[#00d26a]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                            >
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate ${productId === p.id ? 'text-[#00b85c] dark:text-[#00d26a]' : 'text-gray-900 dark:text-gray-100'}`}>
                                                        {p.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono truncate">{p.sku}</p>
                                                </div>
                                                <span className={`ml-3 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                                                    Stock: {badge.label}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Qty + Price row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Quantity <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number" min={1}
                                value={quantity}
                                onChange={e => { setQuantity(e.target.value); if (errors.quantity) setErrors(p => ({ ...p, quantity: '' })); }}
                                placeholder="e.g. 50"
                                className={`w-full h-11 px-3.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00d26a]/30 transition-all
                                    ${errors.quantity ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-[#00d26a]'}`}
                            />
                            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Purchase Price <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">₹</span>
                                <input
                                    type="number" min={0} step="0.01"
                                    value={purchasePrice}
                                    onChange={e => { setPurchasePrice(e.target.value); if (errors.purchasePrice) setErrors(p => ({ ...p, purchasePrice: '' })); }}
                                    placeholder="0.00"
                                    className={`w-full h-11 pl-7 pr-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00d26a]/30 transition-all
                                        ${errors.purchasePrice ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-[#00d26a]'}`}
                                />
                            </div>
                            {errors.purchasePrice && <p className="text-xs text-red-500 mt-1">{errors.purchasePrice}</p>}
                        </div>
                    </div>

                    {/* Total pill */}
                    {totalAmt > 0 && (
                        <div className="flex items-center justify-between bg-[#00d26a]/10 dark:bg-[#00d26a]/10 border border-[#00d26a]/30 dark:border-[#00d26a]/20 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#00d26a] dark:text-[#00d26a]" />
                                <span className="text-sm font-medium text-[#00b85c] dark:text-[#00d26a]">Total Cost</span>
                            </div>
                            <span className="text-lg font-bold text-[#00b85c] dark:text-[#00d26a]">{formatINR(totalAmt)}</span>
                        </div>
                    )}

                    {/* Supplier + Date row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Supplier <span className="text-gray-300 dark:text-gray-600 font-normal normal-case tracking-normal text-[11px]">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={supplierName}
                                onChange={e => setSupplierName(e.target.value)}
                                placeholder="e.g. ABC Distributors"
                                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d26a]/30 focus:border-[#00d26a] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={date} max={today()}
                                onChange={e => setDate(e.target.value)}
                                className={`w-full h-11 px-3.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00d26a]/30 transition-all
                                    ${errors.date ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-[#00d26a]'}`}
                            />
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>
                    </div>
                </div>

                {/* ── Footer ──────────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                    <button onClick={handleClose} disabled={mutation.isPending}
                        className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => { if (validate()) mutation.mutate(); }}
                        disabled={mutation.isPending}
                        className="flex-2 min-w-[160px] h-11 rounded-xl bg-[#00d26a] hover:bg-[#00b85c] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[rgba(0,210,106,0.4)] dark:shadow-none"
                    >
                        {mutation.isPending
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording…</>
                            : <><ShoppingBag className="w-4 h-4" /> Record Purchase</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
