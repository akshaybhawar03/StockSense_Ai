import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import { createTransfer } from '../../services/transfers';
import { getInventory } from '../../services/inventory';
import { useLocation } from '../../contexts/LocationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

export function TransferModal({ isOpen, onClose, onSuccess }: Props) {
  const { locationsList } = useLocation();
  const activeLocations = locationsList.filter(l => l.is_active);

  const [productSearch, setProductSearch] = useState('');
  const [debouncedSearch] = useDebounce(productSearch, 300);
  const [products, setProducts] = useState<any[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [transferDate, setTransferDate] = useState(today());
  const [note, setNote] = useState('');
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Fetch products on search
  useEffect(() => {
    if (!debouncedSearch.trim()) { setProducts([]); return; }
    setProductLoading(true);
    getInventory({ search: debouncedSearch, page_size: 20 })
      .then(res => {
        const d = res.data;
        const list = d.items || d.data || d.products || (Array.isArray(d) ? d : []);
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductLoading(false));
  }, [debouncedSearch]);

  // Fetch available stock when product + from location selected
  useEffect(() => {
    if (!selectedProduct || !fromLocationId) { setAvailableStock(null); return; }
    getInventory({ location_id: fromLocationId, search: selectedProduct.sku || selectedProduct.name, page_size: 1 })
      .then(res => {
        const d = res.data;
        const list = d.items || d.data || d.products || (Array.isArray(d) ? d : []);
        const item = list[0];
        const qty = item?.quantity ?? item?.current_stock ?? item?.stock ?? 0;
        setAvailableStock(qty);
      })
      .catch(() => setAvailableStock(null));
  }, [selectedProduct, fromLocationId]);

  const reset = () => {
    setProductSearch(''); setProducts([]); setSelectedProduct(null);
    setFromLocationId(''); setToLocationId(''); setQuantity('');
    setTransferDate(today()); setNote(''); setAvailableStock(null);
    setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedProduct) e.product = 'Select a product.';
    if (!fromLocationId) e.fromLocation = 'Select source location.';
    if (!toLocationId) e.toLocation = 'Select destination location.';
    if (fromLocationId && toLocationId && fromLocationId === toLocationId) e.toLocation = 'Destination must differ from source.';
    if (!quantity || Number(quantity) < 1 || !Number.isInteger(Number(quantity))) e.quantity = 'Enter a valid quantity (integer ≥ 1).';
    if (availableStock !== null && Number(quantity) > availableStock) e.quantity = `Exceeds available stock (${availableStock} units).`;
    if (availableStock === 0) e.quantity = 'No stock available at this location.';
    if (!transferDate) e.transferDate = 'Transfer date is required.';
    if (transferDate > today()) e.transferDate = 'Transfer date cannot be in the future.';
    if (note.length > 500) e.note = 'Note must be under 500 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await createTransfer({
        product_id: selectedProduct.id,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        quantity: Number(quantity),
        transfer_date: transferDate,
        note: note.trim() || undefined,
      });
      const transferId = res.data?.id ?? '';
      const displayId = 'TRF-' + transferId.slice(-4).toUpperCase();
      toast.success(`Transfer ${displayId} created successfully`);
      // analytics: transfer_completed
      onSuccess();
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Something went wrong, please try again';
      if (err?.response?.status === 400) setErrors(e => ({ ...e, api: msg }));
      else if (err?.response?.status === 403) toast.error('Access denied');
      else toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = (field: string) =>
    `w-full h-10 px-3 rounded-lg border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/30 transition-all ${
      errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-[rgb(var(--accent-primary))]'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[rgb(var(--accent-primary))]/10 to-transparent">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">New Stock Transfer</h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.api && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">
              {errors.api}
            </div>
          )}

          {/* Product search */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Product *</label>
            {selectedProduct ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/5">
                <span className="text-sm text-gray-900 dark:text-white flex-1 truncate">{selectedProduct.name}</span>
                <button onClick={() => { setSelectedProduct(null); setProductSearch(''); setAvailableStock(null); }} className="text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <input
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search product by name or SKU…"
                  className={inputCls('product')}
                />
                {showProductDropdown && (productLoading || products.length > 0) && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {productLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      products.map((p: any) => (
                        <button
                          key={p.id}
                          onMouseDown={() => {
                            setSelectedProduct(p);
                            setProductSearch(p.name);
                            setShowProductDropdown(false);
                            setErrors(e => ({ ...e, product: '' }));
                          }}
                          className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                        >
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
            {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Location *</label>
              <select value={fromLocationId} onChange={e => { setFromLocationId(e.target.value); setAvailableStock(null); }} className={inputCls('fromLocation')}>
                <option value="">Select…</option>
                {activeLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {errors.fromLocation && <p className="text-xs text-red-500 mt-1">{errors.fromLocation}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To Location *</label>
              <select value={toLocationId} onChange={e => setToLocationId(e.target.value)} className={inputCls('toLocation')}>
                <option value="">Select…</option>
                {activeLocations.filter(l => l.id !== fromLocationId).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {errors.toLocation && <p className="text-xs text-red-500 mt-1">{errors.toLocation}</p>}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantity *</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="Units to transfer"
              className={inputCls('quantity')}
            />
            {fromLocationId && selectedProduct && availableStock !== null && (
              <p className={`text-xs mt-1 ${availableStock === 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                Available at {activeLocations.find(l => l.id === fromLocationId)?.name ?? '—'}: <strong>{availableStock}</strong> units
              </p>
            )}
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
          </div>

          {/* Transfer Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Transfer Date *</label>
            <input
              type="date"
              value={transferDate}
              max={today()}
              onChange={e => setTransferDate(e.target.value)}
              className={inputCls('transferDate')}
            />
            {errors.transferDate && <p className="text-xs text-red-500 mt-1">{errors.transferDate}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Note
              <span className="ml-1 text-gray-400 font-normal">({note.length}/500)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Optional note about this transfer…"
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/30 resize-none transition-all ${
                errors.note ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.note && <p className="text-xs text-red-500 mt-1">{errors.note}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || availableStock === 0}
            className="flex-1 h-11 rounded-xl bg-[rgb(var(--accent-primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : 'Create Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}
