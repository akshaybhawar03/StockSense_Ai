import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowUp, ArrowDown, ChevronsUpDown, Package, ChevronLeft, ChevronRight, ScanBarcode, Loader2, Pencil } from 'lucide-react';
import { getInventory, deleteItem, getCategories } from '../../services/inventory';
import { bulkGenerateBarcodes } from '../../services/barcode';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import { EditItemModal } from '../inventory/EditItemModal';
import { BarcodeModal } from '../inventory/BarcodeModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Status helpers ──────────────────────────────────────────────────────────

function resolveStatus(item: any): 'out' | 'low' | 'dead' | 'healthy' {
    const s = item?.alert_type || item?.status || '';
    if (s === 'out_of_stock' || s === 'out') return 'out';
    if (s === 'low' || s === 'critical_low' || s === 'fast_mover_low') return 'low';
    if (s === 'dead' || s === 'dead_stock') return 'dead';
    const qty = item?.quantity ?? item?.stock ?? item?.current_stock ?? 0;
    if (qty === 0) return 'out';
    if (qty <= 10) return 'low';
    return 'healthy';
}

const STATUS_META = {
    out:     { label: 'Out of Stock', dot: 'bg-red-500',    text: 'text-red-600 dark:text-red-400',    row: 'bg-red-50/60 dark:bg-red-900/10' },
    low:     { label: 'Low Stock',    dot: 'bg-amber-400',  text: 'text-amber-600 dark:text-amber-400', row: 'bg-amber-50/60 dark:bg-amber-900/10' },
    dead:    { label: 'Dead Stock',   dot: 'bg-gray-400',   text: 'text-gray-500 dark:text-gray-400',  row: '' },
    healthy: { label: 'In Stock',     dot: 'bg-emerald-500',text: 'text-emerald-600 dark:text-emerald-400', row: '' },
};

function SortIcon({ field, sortField, sortOrder }: { field: string; sortField: string; sortOrder: 'asc' | 'desc' }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-gray-400 ml-1 shrink-0" />;
    return sortOrder === 'asc'
        ? <ArrowUp   className="w-3 h-3 text-[rgb(var(--accent-primary))] ml-1 shrink-0" />
        : <ArrowDown className="w-3 h-3 text-[rgb(var(--accent-primary))] ml-1 shrink-0" />;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function InventoryManager() {
    const queryClient = useQueryClient();

    const [search, setSearch]   = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus]   = useState('');
    const [page, setPage]       = useState(1);
    const [editItem, setEditItem] = useState<any>(null);
    const [barcodeItem, setBarcodeItem] = useState<any>(null);
    const [bulkGenerating, setBulkGenerating] = useState(false);
    const PAGE_SIZE = 50;
    const [debouncedSearch] = useDebounce(search, 300);

    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: string) => {
        if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortOrder('asc'); }
        setPage(1);
    };

    const filters = { search: debouncedSearch, category, status, page, sortField, sortOrder };

    const { data: inventoryData, isLoading } = useQuery({
        queryKey: ['inventory', 'list', filters],
        queryFn: ({ signal }) => getInventory({
            search: debouncedSearch || undefined,
            category: category || undefined,
            status: status || undefined,
            page,
            page_size: PAGE_SIZE,
            sort_by: sortField,
            sort_dir: sortOrder,
        }, signal).then(res => {
            const d = res.data;
            const itemsList  = d.items || d.data || d.products || [];
            const totalCount = d.total  || d.count || itemsList.length;
            return { items: itemsList, total: totalCount };
        }),
        staleTime: 60_000,
    });

    const items = inventoryData?.items ?? [];
    const total = inventoryData?.total ?? 0;

    const { data: categoriesData } = useQuery({
        queryKey: ['inventory', 'categories'],
        queryFn: ({ signal }) => getCategories(signal).then(r => r.data.categories || []),
        staleTime: 60_000,
    });
    const categories: string[] = categoriesData ?? [];

    const handleCsvUploaded = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }, [queryClient]);

    useEffect(() => {
        window.addEventListener('csv-uploaded', handleCsvUploaded);
        return () => window.removeEventListener('csv-uploaded', handleCsvUploaded);
    }, [handleCsvUploaded]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteItem(id),
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ['inventory', 'list'] });
            const previousQueries = queryClient.getQueriesData({ queryKey: ['inventory', 'list'] });
            queryClient.setQueriesData({ queryKey: ['inventory', 'list'] }, (old: any) => {
                if (!old) return old;
                return { ...old, items: old.items.filter((i: any) => i.id !== id), total: old.total - 1 };
            });
            return { previousQueries };
        },
        onError: (_err, _id, context) => {
            context?.previousQueries?.forEach(([k, d]: [any, any]) => queryClient.setQueryData(k, d));
            toast.error('Failed to delete item');
        },
        onSuccess: () => toast.success('Item deleted'),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] }),
    });

    const handleDelete = (id: string, name: string) => {
        if (!window.confirm(`Delete '${name}'? This cannot be undone.`)) return;
        deleteMutation.mutate(id);
    };

    const handleBulkGenerate = async () => {
        setBulkGenerating(true);
        try {
            const res = await bulkGenerateBarcodes();
            const raw = res.data;
            const count = raw?.count ?? raw?.generated ?? raw?.total ?? '?';
            toast.success(`Generated barcodes for ${count} products`);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        } catch (err: any) {
            toast.error(err?.response?.data?.detail ?? 'Failed to generate barcodes');
        } finally {
            setBulkGenerating(false);
        }
    };

    const totalPages  = Math.ceil(total / PAGE_SIZE);
    const rowStart    = items.length ? (page - 1) * PAGE_SIZE + 1 : 0;
    const rowEnd      = Math.min(page * PAGE_SIZE, total);

    // ── Skeleton rows ──────────────────────────────────────────────────────
    const SkeletonRow = ({ i }: { i: number }) => (
        <tr className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/80 dark:bg-gray-800/40'}>
            {[4, 200, 100, 60, 70, 80, 40].map((w, j) => (
                <td key={j} className="px-2 py-1.5 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                    <div className="h-3 rounded animate-pulse bg-gray-200 dark:bg-gray-700" style={{ width: w }} />
                </td>
            ))}
        </tr>
    );

    // ── Column header ──────────────────────────────────────────────────────
    const Col = ({ field, label, className = '' }: { field: string; label: string; className?: string }) => (
        <th
            onClick={() => handleSort(field)}
            className={`px-2 py-2 text-left text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide cursor-pointer select-none border-r border-gray-200 dark:border-gray-700 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700/50 whitespace-nowrap ${sortField === field ? 'bg-[rgb(var(--accent-primary))]/5' : ''} ${className}`}
        >
            <span className="flex items-center">
                {label}
                <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
            </span>
        </th>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">

            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[rgb(var(--accent-primary))]/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-[rgb(var(--accent-primary))]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Smart Inventory Master</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Manage, filter, and update your product catalog in real-time.</p>
                </div>
            </div>

            {/* ── Spreadsheet shell ───────────────────────────────────── */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-gray-900">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none sm:w-48 lg:w-64 min-w-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search name or SKU…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full h-7 pl-7 pr-3 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                        />
                    </div>

                    {/* Category filter */}
                    <select
                        value={category}
                        onChange={e => { setCategory(e.target.value); setPage(1); }}
                        className="h-7 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-2 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* Status filter */}
                    <select
                        value={status}
                        onChange={e => { setStatus(e.target.value); setPage(1); }}
                        className="h-7 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-2 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
                    >
                        <option value="">All Status</option>
                        <option value="out">Out of Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="healthy">Healthy</option>
                        <option value="dead">Dead Stock</option>
                    </select>

                    {/* Generate All Barcodes */}
                    <button
                        onClick={handleBulkGenerate}
                        disabled={bulkGenerating}
                        className="h-7 flex items-center gap-1.5 px-3 text-xs font-medium rounded-md bg-[rgb(var(--accent-primary))] text-white hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
                    >
                        {bulkGenerating
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <ScanBarcode className="w-3 h-3" />}
                        Generate All Barcodes
                    </button>

                    {/* Row count badge */}
                    <span className="ml-auto text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                        {total.toLocaleString('en-IN')} rows
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13px]" style={{ tableLayout: 'fixed' }}>

                        {/* Column widths */}
                        <colgroup>
                            <col style={{ width: 36 }} />   {/* # */}
                            <col style={{ width: 220 }} />  {/* Product */}
                            <col style={{ width: 130 }} />  {/* Category */}
                            <col style={{ width: 80 }} />   {/* Stock */}
                            <col style={{ width: 100 }} />  {/* Unit Price */}
                            <col style={{ width: 110 }} />  {/* Status */}
                            <col style={{ width: 70 }} />   {/* Actions */}
                        </colgroup>

                        {/* Header */}
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                                {/* Row # */}
                                <th className="px-2 py-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 text-center border-r border-gray-200 dark:border-gray-700 select-none">#</th>
                                <Col field="name"     label="Product"    />
                                <Col field="category" label="Category"   />
                                <Col field="quantity" label="Stock"      className="text-right" />
                                <Col field="price"    label="Unit Price" className="text-right" />
                                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-r border-gray-200 dark:border-gray-700 select-none">
                                    Status
                                </th>
                                <th className="px-2 py-2 text-center text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide select-none">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} i={i} />)
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No inventory items found.</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">Upload a CSV to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item: any, idx: number) => {
                                    const st  = resolveStatus(item);
                                    const meta = STATUS_META[st];
                                    const isEven = idx % 2 === 0;
                                    const qty = Number(item.quantity ?? item.stock ?? 0);

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`
                                                group border-b border-gray-100 dark:border-gray-800
                                                ${meta.row || (isEven ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/70 dark:bg-gray-800/30')}
                                                hover:bg-[rgb(var(--accent-primary))]/5 dark:hover:bg-[rgb(var(--accent-primary))]/5
                                                transition-colors duration-75
                                            `}
                                        >
                                            {/* Row number */}
                                            <td className="px-1 py-1 text-center text-[11px] text-gray-400 dark:text-gray-600 border-r border-gray-100 dark:border-gray-800 select-none font-mono tabular-nums">
                                                {rowStart + idx}
                                            </td>

                                            {/* Product */}
                                            <td className="px-2 py-1 border-r border-gray-100 dark:border-gray-800 overflow-hidden">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-[13px] leading-tight">
                                                    {item.name || 'Unknown'}
                                                </p>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono truncate leading-tight">
                                                    {item.sku || '—'}
                                                </p>
                                            </td>

                                            {/* Category */}
                                            <td className="px-2 py-1 border-r border-gray-100 dark:border-gray-800 overflow-hidden">
                                                <span className="text-[12px] text-gray-600 dark:text-gray-400 truncate block">
                                                    {item.category || 'Uncategorized'}
                                                </span>
                                            </td>

                                            {/* Stock — color-coded */}
                                            <td className="px-2 py-1 text-right border-r border-gray-100 dark:border-gray-800">
                                                <span className={`
                                                    font-mono font-semibold text-[13px] tabular-nums
                                                    ${st === 'out'     ? 'text-red-600 dark:text-red-400'
                                                    : st === 'low'     ? 'text-amber-600 dark:text-amber-400'
                                                    : st === 'dead'    ? 'text-gray-400 dark:text-gray-500'
                                                    : 'text-gray-800 dark:text-gray-200'}
                                                `}>
                                                    {qty.toLocaleString('en-IN')}
                                                </span>
                                            </td>

                                            {/* Unit price */}
                                            <td className="px-2 py-1 text-right border-r border-gray-100 dark:border-gray-800">
                                                <span className="font-mono text-[13px] tabular-nums text-[rgb(var(--accent-primary))]">
                                                    ₹{Number(item.unit_price ?? item.price ?? 0).toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2, maximumFractionDigits: 2,
                                                    })}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-2 py-1 border-r border-gray-100 dark:border-gray-800">
                                                <span className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                                                    <span className={`text-[12px] font-medium ${meta.text}`}>{meta.label}</span>
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-2 py-1 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setEditItem(item)}
                                                        title="Edit"
                                                        className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => setBarcodeItem(item)}
                                                        title={item.barcode ? `Barcode: ${item.barcode}` : 'No barcode — click to assign'}
                                                        className={`p-1 rounded transition-colors ${
                                                            item.barcode
                                                                ? 'text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/10'
                                                                : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        <ScanBarcode className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums">
                        {items.length
                            ? <>Rows <strong>{rowStart}</strong>–<strong>{rowEnd}</strong> of <strong>{total.toLocaleString('en-IN')}</strong></>
                            : 'No rows'}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-6 w-6 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="px-2 text-[11px] text-gray-600 dark:text-gray-300 tabular-nums">
                            {page} / {totalPages || 1}
                        </span>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || totalPages === 0}
                            className="h-6 w-6 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit modal */}
            {editItem && (
                <EditItemModal
                    item={editItem}
                    onClose={() => setEditItem(null)}
                    onSaved={() => queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] })}
                />
            )}

            {/* Barcode modal */}
            {barcodeItem && (
                <BarcodeModal
                    item={barcodeItem}
                    onClose={() => setBarcodeItem(null)}
                />
            )}
        </motion.div>
    );
}
