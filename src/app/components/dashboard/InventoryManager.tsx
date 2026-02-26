import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Filter, ArrowUpDown, Package, Edit2, Check, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { db, InventoryItem } from '../../lib/db';

type SortField = 'name' | 'sku' | 'category' | 'stock' | 'price' | 'sales';
type SortOrder = 'asc' | 'desc';

export function InventoryManager() {
    const { inventory, refreshData } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');

    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Inline edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ stock: number, price: number }>({ stock: 0, price: 0 });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleEditStart = (item: InventoryItem) => {
        setEditingId(item.id);
        setEditForm({ stock: item.stock, price: item.price });
    };

    const handleEditCancel = () => {
        setEditingId(null);
    };

    const handleEditSave = async (id: string) => {
        try {
            await db.inventory.update(id, {
                stock: editForm.stock,
                price: editForm.price
            });
            await refreshData();
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update item:", error);
        }
    };

    const filteredAndSorted = useMemo(() => {
        let result = [...inventory];

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.name && item.name.toLowerCase().includes(query)) ||
                item.sku.toLowerCase().includes(query) ||
                (item.category && item.category.toLowerCase().includes(query))
            );
        }

        // Filter by status
        if (statusFilter === 'low') {
            result = result.filter(item => item.stock > 0 && item.stock <= 10);
        } else if (statusFilter === 'out') {
            result = result.filter(item => item.stock === 0);
        }

        // Sort
        result.sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [inventory, searchQuery, statusFilter, sortField, sortOrder]);

    const getStockBadge = (stock: number) => {
        if (stock === 0) return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Out of Stock</Badge>;
        if (stock <= 10) return <Badge variant="default" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">Low Stock</Badge>;
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">In Stock</Badge>;
    };

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
                            placeholder="Search by SKU, Name or Category..."
                            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('all')}
                            className={statusFilter === 'all' ? 'bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90' : ''}
                        >
                            All
                        </Button>
                        <Button
                            variant={statusFilter === 'low' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('low')}
                            className={statusFilter === 'low' ? 'bg-orange-500 hover:bg-orange-600 text-white border-0' : ''}
                        >
                            Low Stock
                        </Button>
                        <Button
                            variant={statusFilter === 'out' ? 'destructive' : 'outline'}
                            onClick={() => setStatusFilter('out')}
                        >
                            Out of Stock
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
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
                                    <Button variant="ghost" className="font-semibold text-gray-700 dark:text-gray-300 ml-auto -mr-4" onClick={() => handleSort('stock')}>
                                        Stock {sortField === 'stock' && <ArrowUpDown className="ml-2 w-3 h-3" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" className="font-semibold text-gray-700 dark:text-gray-300 ml-auto -mr-4" onClick={() => handleSort('price')}>
                                        Unit Price {sortField === 'price' && <ArrowUpDown className="ml-2 w-3 h-3" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" className="font-semibold text-gray-700 dark:text-gray-300 ml-auto -mr-4" onClick={() => handleSort('sales')}>
                                        Total Sales {sortField === 'sales' && <ArrowUpDown className="ml-2 w-3 h-3" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center w-[120px]">Status</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSorted.length > 0 ? filteredAndSorted.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 group">
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name || 'Unnamed Product'}</div>
                                        <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">
                                        {item.category || 'Uncategorized'}
                                    </TableCell>

                                    {/* Inline Edit Columns */}
                                    {editingId === item.id ? (
                                        <>
                                            <TableCell className="text-right pt-4">
                                                <Input
                                                    type="number"
                                                    className="w-20 ml-auto h-8 text-right"
                                                    value={editForm.stock}
                                                    onChange={e => setEditForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right pt-4">
                                                <Input
                                                    type="number"
                                                    className="w-24 ml-auto h-8 text-right"
                                                    value={editForm.price}
                                                    onChange={e => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                />
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="text-right font-medium">
                                                {item.stock.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-[rgb(var(--accent-primary))]">
                                                ₹{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </>
                                    )}

                                    <TableCell className="text-right">
                                        {item.sales.toLocaleString()} units
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStockBadge(editingId === item.id ? editForm.stock : item.stock)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingId === item.id ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleEditSave(item.id)}>
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100" onClick={handleEditCancel}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[rgb(var(--accent-primary))] hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                onClick={() => handleEditStart(item)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
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
            </Card>
        </motion.div>
    );
}
