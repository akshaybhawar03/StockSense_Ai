import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, CheckCircle, Download, Search, ChevronDown, ShoppingCart, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInventory } from '../../services/inventory';
import { createSale } from '../../services/sales';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';

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
    return { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: `${qty}` };
}

export function SaleModal({ isOpen, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();

    const [productId, setProductId]       = useState('');
    const [quantity, setQuantity]         = useState('');
    const [salePrice, setSalePrice]       = useState('');
    const [customerName, setCustomerName] = useState('');
    const [date, setDate]                 = useState(today());
    const [errors, setErrors]             = useState<Record<string, string>>({});
    const [successData, setSuccessData]   = useState<{ invoiceId: string; productName: string; qty: number; price: number; customer: string; date: string } | null>(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery]       = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevProductId = useRef('');

    const { data: productsRes } = useQuery({
        queryKey: ['inventory', 'list', { page: 1, pageSize: 1000 }],
        queryFn: ({ signal }) =>
            getInventory({ page: 1, page_size: 1000 }, signal).then(r => {
                const d = r.data;
                return d.items || d.data || d.products || [];
            }),
        staleTime: 60_000,
        enabled: isOpen,
    });
    const products: any[] = productsRes ?? [];
    const selectedProduct = products.find(p => p.id === productId);
    const availableStock: number = selectedProduct?.quantity ?? selectedProduct?.stock ?? selectedProduct?.current_stock ?? 0;

    const filteredProducts = products.filter((p: any) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-fill price on product change
    useEffect(() => {
        if (productId && productId !== prevProductId.current) {
            const p = products.find((x: any) => x.id === productId);
            if (p) setSalePrice(String(p.unit_price ?? p.price ?? ''));
            prevProductId.current = productId;
        }
    }, [productId, products]);

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
        setProductId(''); setQuantity(''); setSalePrice('');
        setCustomerName(''); setDate(today());
        setErrors({}); setSuccessData(null);
        setIsDropdownOpen(false); setSearchQuery('');
        onClose();
    }

    function validate() {
        const e: Record<string, string> = {};
        if (!productId)                                       e.product   = 'Select a product';
        if (!quantity || Number(quantity) < 1)                e.quantity  = 'Minimum 1';
        else if (Number(quantity) > availableStock)           e.quantity  = `Max ${availableStock}`;
        if (!salePrice || Number(salePrice) <= 0)             e.salePrice = 'Enter a valid price';
        if (!date)                                            e.date      = 'Select a date';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    const mutation = useMutation({
        mutationFn: () => createSale({
            product_id: productId,
            quantity: Number(quantity),
            sale_price: Number(salePrice),
            customer_name: customerName || undefined,
            date,
        }),
        onSuccess: (res) => {
            const invoiceId: string = res.data?.invoice_id ?? res.data?.id ?? 'INV-' + Date.now();
            toast.success('Sale recorded! Invoice generated.');
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setSuccessData({
                invoiceId,
                productName: selectedProduct?.name ?? 'Product',
                qty: Number(quantity),
                price: Number(salePrice),
                customer: customerName,
                date,
            });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || err?.message || 'Failed to record sale');
        },
    });

    function handleDownloadInvoice() {
        if (!successData) return;
        const total = successData.qty * successData.price;
        generateInvoicePDF({
            invoice_number: successData.invoiceId,
            date:           successData.date,
            customer_name:  successData.customer,
            subtotal:       total,
            gst:            0,
            total:          total,
            received:       total,
            balance:        0,
            payment_mode:   'Cash',
            items: [{
                name:       successData.productName,
                quantity:   successData.qty,
                unit_price: successData.price,
                amount:     total,
            }],
        });
        onSuccess();
        handleClose();
    }

    function handleWhatsAppShare() {
        if (!successData) return;
        const total = successData.qty * successData.price;
        const greeting = successData.customer
            ? `Hello ${successData.customer}! 👋`
            : `Hello! 👋`;
        const invoiceLink = `\n🔗 View invoices: ${window.location.origin}/dashboard/invoices`;
        const message =
`${greeting}

Thank you for your purchase at SmartGodown! 🙏

Here are your order details:

🧾 Invoice No : ${successData.invoiceId}
📦 Product    : ${successData.productName}
🔢 Quantity   : ${successData.qty} units
💰 Price      : ₹${successData.price.toFixed(2)} per unit
💵 Total Paid : ₹${total.toFixed(2)}
📅 Date       : ${successData.date}
${invoiceLink}

We appreciate your business! 😊
— SmartGodown Team`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    }

    const totalAmt = Number(quantity) > 0 && Number(salePrice) > 0
        ? Number(quantity) * Number(salePrice) : 0;

    if (!isOpen) return null;

    // ── Success screen ────────────────────────────────────────────────────────
    if (successData) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CheckCircle className="w-9 h-9 text-blue-500" />
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Sale Recorded!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Invoice has been generated successfully.</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2 w-full">
                        <button onClick={() => { onSuccess(); handleClose(); }}
                            className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Close
                        </button>
                        <button onClick={handleDownloadInvoice}
                            className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                            <Download className="w-4 h-4" /> Download
                        </button>
                    </div>
                    <button onClick={handleWhatsAppShare}
                        className="w-full h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                        style={{ backgroundColor: '#25D366' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1ebe5d')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Share on WhatsApp
                    </button>
                </div>
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

                {/* ── Coloured header ─────────────────────────────────── */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white leading-tight">Record New Sale</h2>
                                <p className="text-xs text-blue-100 mt-0.5">Fill details to generate invoice</p>
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
                                ${errors.product ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400'}
                                ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
                                text-gray-700 dark:text-gray-200`}
                        >
                            <span className={selectedProduct ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                                {selectedProduct ? `${selectedProduct.name}` : 'Select a product…'}
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
                                            className="w-full h-8 pl-7 pr-3 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                                                    ${productId === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                            >
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate ${productId === p.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
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
                                type="number" min={1} max={availableStock}
                                value={quantity}
                                onChange={e => { setQuantity(e.target.value); if (errors.quantity) setErrors(p => ({ ...p, quantity: '' })); }}
                                placeholder="e.g. 5"
                                className={`w-full h-11 px-3.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                                    ${errors.quantity ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'}`}
                            />
                            {errors.quantity
                                ? <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>
                                : selectedProduct && <p className="text-xs text-gray-400 mt-1">Max: {availableStock}</p>
                            }
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Sale Price <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">₹</span>
                                <input
                                    type="number" min={0} step="0.01"
                                    value={salePrice}
                                    onChange={e => { setSalePrice(e.target.value); if (errors.salePrice) setErrors(p => ({ ...p, salePrice: '' })); }}
                                    placeholder="0.00"
                                    className={`w-full h-11 pl-7 pr-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                                        ${errors.salePrice ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'}`}
                                />
                            </div>
                            {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
                        </div>
                    </div>

                    {/* Total pill */}
                    {totalAmt > 0 && (
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Amount</span>
                            </div>
                            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatINR(totalAmt)}</span>
                        </div>
                    )}

                    {/* Customer + Date row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Customer <span className="text-gray-300 dark:text-gray-600 font-normal normal-case tracking-normal text-[11px]">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
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
                                className={`w-full h-11 px-3.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                                    ${errors.date ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'}`}
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
                        className="flex-2 min-w-[160px] h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
                    >
                        {mutation.isPending
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording…</>
                            : <><Receipt className="w-4 h-4" /> Generate Invoice</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
