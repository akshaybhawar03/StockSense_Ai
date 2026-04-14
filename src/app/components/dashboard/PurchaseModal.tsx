import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, CheckCircle, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
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

export function PurchaseModal({ isOpen, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();

    const [productId, setProductId]       = useState('');
    const [quantity, setQuantity]         = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [date, setDate]                 = useState(today());
    const [errors, setErrors]             = useState<Record<string, string>>({});
    const [done, setDone]                 = useState(false);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Escape key handling & Click outside
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
        setProductId(''); setQuantity(''); setPurchasePrice('');
        setSupplierName(''); setDate(today());
        setErrors({}); setDone(false);
        setIsDropdownOpen(false);
        setSearchQuery('');
        onClose();
    }

    function validate() {
        const e: Record<string, string> = {};
        if (!productId)                                    e.product       = 'Please select a product';
        if (!quantity || Number(quantity) < 1)             e.quantity      = 'Quantity must be at least 1';
        if (!purchasePrice || Number(purchasePrice) <= 0)  e.purchasePrice = 'Please enter a valid price';
        if (!date)                                         e.date          = 'Please select a date';
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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record New Purchase</h2>
                    <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Success state */}
                {done ? (
                    <div className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">Purchase Recorded!</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stock has been updated successfully.</p>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => { onSuccess(); handleClose(); }}>
                            Done
                        </Button>
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
                                className={`w-full h-10 border ${errors.product ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 transition-shadow`}
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
                                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium'
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
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                placeholder="e.g. 50"
                                className="w-full h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                        </div>

                        {/* Purchase Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Purchase Price (per unit) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={purchasePrice}
                                    onChange={e => setPurchasePrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            {errors.purchasePrice && <p className="text-xs text-red-500 mt-1">{errors.purchasePrice}</p>}
                        </div>

                        {/* Total preview */}
                        {quantity && purchasePrice && Number(quantity) > 0 && Number(purchasePrice) > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost</span>
                                <span className="text-base font-bold text-blue-700 dark:text-blue-400">
                                    {formatINR(Number(quantity) * Number(purchasePrice))}
                                </span>
                            </div>
                        )}

                        {/* Supplier Name (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Supplier Name <span className="text-gray-400 text-xs">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={supplierName}
                                onChange={e => setSupplierName(e.target.value)}
                                placeholder="e.g. ABC Distributors"
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
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={mutation.isPending}
                                onClick={() => { if (validate()) mutation.mutate(); }}
                            >
                                {mutation.isPending
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording…</>
                                    : 'Record Purchase'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
