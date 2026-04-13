import React, { useState, useEffect, useCallback } from 'react';
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
import StatusBadge from '../ui/StatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventorySkeleton } from '../skeletons/InventorySkeleton';

export function InventoryManager() {
    const queryClient = useQueryClient();

    // Filter/pagination state (still local)
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [editItem, setEditItem] = useState<any>(null);
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

    const filters = { search: debouncedSearch, category, status, page, sortField, sortOrder };

    // React Query: Inventory list
    const { data: inventoryData, isLoading: loading } = useQuery({
        queryKey: ['inventory', 'list', filters],
        queryFn: ({ signal }) => getInventory({
            search: debouncedSearch || undefined,
            category: category || undefined,
            status: status || undefined,
            page,
            page_size: PAGE_SIZE,
            sort_by: sortField,
            sort_dir: sortOrder
        }, signal).then(res => {
            const data = res.data;
            const itemsList = data.items || data.data || data.products || [];
            const totalCount = data.total || data.count || itemsList.length;
            return { items: itemsList, total: totalCount };
        }),
        staleTime: 60_000,
    });

    const items = inventoryData?.items ?? [];
    const total = inventoryData?.total ?? 0;

    // React Query: Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['inventory', 'categories'],
        queryFn: ({ signal }) => getCategories(signal).then(r => r.data.categories || []),
        staleTime: 60_000,
    });

    const categories = categoriesData ?? [];

    // Invalidate on CSV upload
    const handleCsvUploaded = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }, [queryClient]);

    useEffect(() => {
        window.addEventListener('csv-uploaded', handleCsvUploaded);
        return () => window.removeEventListener('csv-uploaded', handleCsvUploaded);
    }, [handleCsvUploaded]);

    // Optimistic delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteItem(id),
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ['inventory', 'list'] });
            const previousQueries = queryClient.getQueriesData({ queryKey: ['inventory', 'list'] });
            queryClient.setQueriesData(
                { queryKey: ['inventory', 'list'] },
                (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        items: old.items.filter((item: any) => item.id !== id),
                        total: old.total - 1,
                    };
                }
            );
            return { previousQueries };
        },
        onError: (_err, _id, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]: [any, any]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error('Failed to delete item');
        },
        onSuccess: () => {
            toast.success('Item deleted');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] });
        },
    });

    const handleDelete = (id: string, name: string) => {
        if (!window.confirm(`Delete '${name}'? This cannot be undone.`)) return;
        deleteMutation.mutate(id);
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
                            {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
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
                            {!loading && items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                                            <p className="text-gray-400 text-sm">No inventory items found.</p>
                                            <p className="text-gray-500 text-xs">Upload a CSV to get started.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : items.map((item: any) => (
                                <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 group">
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">SKU: {item.sku || '-'}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                        {item.category || 'Uncategorized'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {Number(item.quantity ?? 0).toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-[rgb(var(--accent-primary))]">
                                        {'₹' + Number(item.unit_price ?? item.price ?? 0).toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge item={item} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
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
                            ))}
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
                    onSaved={() => queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] })}
                />
            )}
        </motion.div>
    );
}

