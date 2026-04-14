import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, CheckCircle, Download, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { getInventory } from '../../services/inventory';
import { createSale, downloadInvoice } from '../../services/sales';

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

export function SaleModal({ isOpen, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();

    // Form state
    const [productId, setProductId]       = useState('');
    const [quantity, setQuantity]         = useState('');
    const [salePrice, setSalePrice]       = useState('');
    const [customerName, setCustomerName] = useState('');
    const [date, setDate]                 = useState(today());
    const [errors, setErrors]             = useState<Record<string, string>>({});
    const [successData, setSuccessData]   = useState<{ invoiceId: string } | null>(null);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch products
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

    const selectedProduct = products.find((p: any) => p.id === productId);
    const availableStock: number =
        selectedProduct?.quantity ?? selectedProduct?.stock ?? selectedProduct?.current_stock ?? 0;

    // Auto-fill price on product change
    const prevProductId = useRef('');
    useEffect(() => {
        if (productId && productId !== prevProductId.current) {
            const p = products.find((x: any) => x.id === productId);
            if (p) {
                const price = p.unit_price ?? p.price ?? '';
                setSalePrice(price !== '' ? String(price) : '');
            }
            prevProductId.current = productId;
        }
    }, [productId, products]);

    const filteredProducts = products.filter((p: any) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Escape key + reset on open/close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isDropdownOpen) {
                    setIsDropdownOpen(false);
                } else if (isOpen) {
                    handleClose();
                }
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isDropdownOpen]);

    function handleClose() {
        setProductId(''); setQuantity(''); setSalePrice('');
        setCustomerName(''); setDate(today());
        setErrors({}); setSuccessData(null);
        setIsDropdownOpen(false);
        setSearchQuery('');
        onClose();
    }

    function validate() {
        const e: Record<string, string> = {};
        if (!productId)         e.product  = 'Please select a product';
        if (!quantity)          e.quantity  = 'Quantity must be at least 1';
        else if (Number(quantity) < 1)            e.quantity  = 'Quantity must be at least 1';
        else if (Number(quantity) > availableStock) e.quantity = `Only ${availableStock} units available in stock`;
        if (!salePrice || Number(salePrice) <= 0) e.salePrice = 'Please enter a valid price';
        if (!date)              e.date      = 'Please select a date';
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
            const invoiceId: string = res.data?.invoice_id ?? res.data?.id ?? '';
            toast.success('Sale recorded! Invoice generated.');
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            if (invoiceId) {
                setSuccessData({ invoiceId });
            } else {
                onSuccess();
                handleClose();
            }
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.detail
                || err?.response?.data?.message
                || err?.message
                || 'Failed to record sale';
            toast.error(msg);
        },
    });

    async function handleDownloadInvoice() {
        if (!successData?.invoiceId) return;
        try {
            const res = await downloadInvoice(successData.invoiceId);
            const blob = new Blob([res.data]);
            const url  = window.URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `invoice_${successData.invoiceId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Could not download invoice');
        } finally {
            onSuccess();
            handleClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record New Sale</h2>
                    <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Success state */}
                {successData ? (
                    <div className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">Sale Recorded!</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Invoice has been generated successfully.</p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1" onClick={() => { onSuccess(); handleClose(); }}>
                                Close
                            </Button>
                            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleDownloadInvoice}>
                                <Download className="w-4 h-4 mr-2" /> Download Invoice
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">

                        {/* Product */}
                        <div ref={dropdownRef} className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Product <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Combobox Trigger */}
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full h-10 border ${errors.product ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-green-500 transition-shadow`}
                            >
                                <span className={selectedProduct ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                                    {selectedProduct 
                                        ? `${selectedProduct.name} (${selectedProduct.sku})` 
                                        : 'Select a product…'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
                                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Search by name or SKU..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                    
                                    <ul className="max-h-60 overflow-y-auto p-1">
                                        {filteredProducts.length === 0 ? (
                                            <li className="p-3 text-sm text-center text-gray-500">No products found</li>
                                        ) : (
                                            filteredProducts.map((p: any) => (
                                                <li
                                                    key={p.id}
                                                    onClick={() => {
                                                        setProductId(p.id);
                                                        setIsDropdownOpen(false);
                                                        setSearchQuery('');
                                                        if (errors.product) setErrors(prev => ({ ...prev, product: '' }));
                                                    }}
                                                    className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex justify-between items-center ${
                                                        p.id === productId
                                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-medium'
                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <span className="truncate pr-4">{p.name} <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">({p.sku})</span></span>
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                        Stock: {p.quantity ?? p.stock ?? p.current_stock ?? 0}
                                                    </span>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            )}

                            {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={availableStock}
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                placeholder="e.g. 5"
                                className="w-full h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {productId && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Available: <span className="font-medium">{availableStock} units</span>
                                </p>
                            )}
                            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                        </div>

                        {/* Selling Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Selling Price (per unit) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={salePrice}
                                    onChange={e => setSalePrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
                        </div>

                        {/* Total preview */}
                        {quantity && salePrice && Number(quantity) > 0 && Number(salePrice) > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
                                <span className="text-base font-bold text-green-700 dark:text-green-400">
                                    {formatINR(Number(quantity) * Number(salePrice))}
                                </span>
                            </div>
                        )}

                        {/* Customer Name (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Customer Name <span className="text-gray-400 text-xs">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={date}
                                max={today()}
                                onChange={e => setDate(e.target.value)}
                                className="w-full h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={mutation.isPending}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                disabled={mutation.isPending}
                                onClick={() => { if (validate()) mutation.mutate(); }}
                            >
                                {mutation.isPending
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording…</>
                                    : 'Generate Invoice'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
