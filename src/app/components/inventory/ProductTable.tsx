import React, { useState } from 'react';
import { useProducts, useDeleteProducts, useUpdateProduct } from '../../lib/queries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Search, Edit2, Trash2, ArrowUpDown, Download, Check, X } from 'lucide-react';
import { StatusBadge } from './LowStockAlert';
import { Product } from '../../types/inventory';
import toast from 'react-hot-toast';

export function ProductTable() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{ stock: number, price: number }>({ stock: 0, price: 0 });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { data, isLoading } = useProducts(page);
    const deleteMutation = useDeleteProducts();
    const updateMutation = useUpdateProduct();

    const handleEditStart = (p: Product) => {
        setEditingId(p.id);
        setEditForm({ stock: p.stock, price: p.price });
    };

    const handleEditSave = async (id: number) => {
        try {
            await updateMutation.mutateAsync({ id, data: editForm });
            toast.success('Product updated');
            setEditingId(null);
        } catch {
            toast.error('Failed to update');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (confirm(`Delete ${selectedIds.length} items?`)) {
            try {
                await deleteMutation.mutateAsync(selectedIds);
                toast.success(`Deleted ${selectedIds.length} products`);
                setSelectedIds([]);
            } catch {
                toast.error('Failed to delete');
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading inventory...</div>;

    const products = data?.data || [];
    const filteredProducts = products.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

    return (
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search inventory..."
                        className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => toast("Export CSV not yet implemented")}><Download className="w-4 h-4" /> Export</Button>
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600 shadow-md" onClick={handleBulkDelete}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300">
                        <TableRow>
                            <TableHead className="w-12 text-center">
                                <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? products.map((p: Product) => p.id) : [])} checked={products.length > 0 && selectedIds.length === products.length} className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            </TableHead>
                            <TableHead>Product <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-50" /></TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((p: Product) => (
                            <TableRow key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 group transition-colors even:bg-gray-50/20 dark:even:bg-gray-800/10">
                                <TableCell className="text-center">
                                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))} className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                                    <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                                </TableCell>
                                <TableCell className="text-gray-600 dark:text-gray-400">{p.category}</TableCell>

                                {editingId === p.id ? (
                                    <>
                                        <TableCell className="text-right"><Input type="number" className="w-20 ml-auto h-8" value={editForm.stock} onChange={e => setEditForm(prev => ({ ...prev, stock: +e.target.value }))} /></TableCell>
                                        <TableCell className="text-right"><Input type="number" className="w-24 ml-auto h-8" value={editForm.price} onChange={e => setEditForm(prev => ({ ...prev, price: +e.target.value }))} /></TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell className="text-right font-medium">{p.stock}</TableCell>
                                        <TableCell className="text-right font-medium text-[rgb(var(--accent-primary))]">₹{p.price}</TableCell>
                                    </>
                                )}

                                <TableCell className="text-center"><StatusBadge stock={editingId === p.id ? editForm.stock : p.stock} /></TableCell>
                                <TableCell className="text-right">
                                    {editingId === p.id ? (
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleEditSave(p.id)}><Check className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-gray-100" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-[rgb(var(--accent-primary))] hover:bg-green-50 dark:hover:bg-green-900/30" onClick={() => handleEditStart(p)}><Edit2 className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => { setSelectedIds([p.id]); handleBulkDelete(); }}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm text-gray-500">
                <span>Showing {filteredProducts.length} items</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            </div>
        </Card>
    );
}
