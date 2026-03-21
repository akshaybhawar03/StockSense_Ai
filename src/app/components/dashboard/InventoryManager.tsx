import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, ArrowUpDown, Package, Edit2, Trash2 } from 'lucide-react';
import { getInventory, deleteItem, getCategories } from '../../services/inventory';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import { EditItemModal } from '../inventory/EditItemModal';

export function InventoryManager() {
    // State variables based on PRD
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState<any>(null); // item being edited

    const PAGE_SIZE = 50;
    const [debouncedSearch] = useDebounce(search, 300);

    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setPage(1);
    };

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await getInventory({
                search: debouncedSearch || undefined,
                category: category || undefined,
                status: status || undefined,
                page,
                page_size: PAGE_SIZE,
                sort_by: sortField,
                sort_dir: sortOrder
            });
            setItems(res.data.items);
            setTotal(res.data.total);
        } catch (err) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    // Load table data and handle CSV upload refresh
    useEffect(() => {
        fetchInventory();

        const handleCsvUpload = () => {
            fetchInventory();
        };

        window.addEventListener('csv-uploaded', handleCsvUpload);
        return () => window.removeEventListener('csv-uploaded', handleCsvUpload);
    }, [debouncedSearch, category, status, page, sortField, sortOrder]);

    // Load categories
    useEffect(() => {
        getCategories()
            .then(r => setCategories(r.data.categories || []))
            .catch(() => {});
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Delete '${name}'? This cannot be undone.`)) return;
        try {
            await deleteItem(id);
            toast.success(`'${name}' deleted`);
            fetchInventory(); // refresh list
        } catch {
            toast.error('Failed to delete item');
        }
    };

    const getStockBadge = (alert_type: string) => {
        switch (alert_type) {
            case 'out_of_stock':
                return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Out of Stock</Badge>;
            case 'low':
                return <Badge variant="default" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">Low Stock</Badge>;
            case 'healthy':
                return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Healthy</Badge>;
            case 'dead':
                return <Badge variant="outline" className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-0">Dead Stock</Badge>;
            default:
                return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Available</Badge>;
        }
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                        Smart Inventory Master
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Manage, filter, and update your product catalog in real-time.
                    </p>
                </div>
            </div>

            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or SKU..."
                            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <select
                            value={category}
                            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                            className="h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="out">Out of Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="healthy">Healthy</option>
                            <option value="dead">Dead Stock</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <Table>
                        <TableHeader className="bg-gray-50/80 dark:bg-gray-800/80">
                            <TableRow>
                                <TableHead className="w-[300px]">
                                    <Button variant="ghost" className="font-semibold text-gray-700 dark:text-gray-300 -ml-4" onClick={() => handleSort('name')}>
                                        Product Details {sortField === 'name' && <ArrowUpDown className="ml-2 w-3 h-3" />}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" className="font-semibold text-gray-700 dark:text-gray-300 -ml-4" onClick={() => handleSort('category')}>
                                        Category {sortField === 'category' && <ArrowUpDown className="ml-2 w-3 h-3" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" className="font-semibold text-gray-700 dark:text-gray-300 ml-auto -mr-4" onClick={() => handleSort('quantity')}>
                                        Stock {sortField === 'quantity' && <ArrowUpDown className="ml-2 w-3 h-3" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" className="font-semibold text-gray-700 dark:text-gray-300 ml-auto -mr-4" onClick={() => handleSort('price')}>
                                        Unit Price {sortField === 'price' && <ArrowUpDown className="ml-2 w-3 h-3" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center w-[120px]">Status</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        Loading inventory...
                                    </TableCell>
                                </TableRow>
                            ) : items.length > 0 ? items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 group">
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name || 'Unnamed Product'}</div>
                                        <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                        {item.category || 'Uncategorized'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {(item.quantity ?? item.stock).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-[rgb(var(--accent-primary))]">
                                        ₹{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStockBadge(item.alert_type)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                onClick={() => setEditItem(item)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                onClick={() => handleDelete(item.id, item.name)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-300 mb-2" />
                                            <p>No inventory items found matching your filters.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {items.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString('en-IN')} products
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="bg-white dark:bg-gray-900"
                        >
                            Previous
                        </Button>
                        <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 flex items-center">
                            Page {page} of {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="bg-white dark:bg-gray-900"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>

            {editItem && (
                <EditItemModal
                    item={editItem}
                    onClose={() => setEditItem(null)}
                    onSaved={() => fetchInventory()}
                />
            )}
        </motion.div>
    );
}
