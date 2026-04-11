import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '../../types/inventory';
import { recordSale } from '../../services/inventory';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

export function RecordSaleModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const queryClient = useQueryClient();
    const [quantity, setQuantity] = useState<number | string>(1);
    const [salePrice, setSalePrice] = useState<number | string>(product.price);
    const [notes, setNotes] = useState('');

    const mutation = useMutation({
        mutationFn: (data: { product_id: string; quantity: number; sale_price: number; notes?: string }) =>
            recordSale(data),
        onSuccess: () => {
            toast.success('Sale recorded! Stock updated.');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] });
            onClose();
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.detail || error.message || 'Failed to record sale';
            toast.error(errorMsg);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = Number(quantity);
        const sprice = Number(salePrice);

        if (qty <= 0) {
            toast.error('Quantity must be greater than 0');
            return;
        }
        if (qty > product.stock) {
            toast.error('Insufficient stock');
            return;
        }
        if (sprice < 0) {
            toast.error('Sale price cannot be negative');
            return;
        }

        mutation.mutate({
            product_id: String(product.id),
            quantity: qty,
            sale_price: sprice,
            notes: notes
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Record Sale</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                        <input 
                            type="text" 
                            disabled 
                            value={product.name} 
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity Sold (Max: {product.stock})
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                max={product.stock}
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent outline-none dark:text-white transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sale Price per Unit (₹)
                            </label>
                            <input 
                                type="number" 
                                min="0"
                                step="0.01"
                                required
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent outline-none dark:text-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent outline-none dark:text-white transition-all"
                            placeholder="e.g. Bulk discount applied"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending} className="bg-[rgb(var(--accent-primary))] hover:brightness-110 text-white">
                            {mutation.isPending ? 'Recording...' : 'Record Sale'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
