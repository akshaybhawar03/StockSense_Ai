import React, { useState } from 'react';
import { updateItem } from '../../services/inventory';
import { triggerScan } from '../../services/notificationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function EditItemModal({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void; }) {
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(item.quantity !== undefined ? item.quantity : item.stock);
  const [price, setPrice] = useState(item.price);
  const [cat, setCat] = useState(item.category);

  const updateMutation = useMutation({
    mutationFn: (updatedFields: { quantity: number; price: number; category: string }) =>
      updateItem(item.id, updatedFields),
    onMutate: async (updatedFields) => {
      // Cancel in-flight inventory queries
      await queryClient.cancelQueries({ queryKey: ['inventory', 'list'] });

      // Snapshot previous data for rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: ['inventory', 'list'] });

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: ['inventory', 'list'] },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((i: any) =>
              i.id === item.id
                ? { ...i, ...updatedFields, unit_price: updatedFields.price }
                : i
            ),
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to update item');
    },
    onSuccess: () => {
      toast.success('Item updated');
      const token = localStorage.getItem('access_token');
      if (token) triggerScan(token).catch(console.error);
      onSaved();
      onClose();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      quantity: Number(qty),
      price: Number(price),
      category: cat,
    });
  };

  const saving = updateMutation.isPending;

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg'>
        <h2 className='text-lg font-medium mb-1 dark:text-gray-100'>{item.name}</h2>
        <p className='text-sm text-gray-500 mb-4'>SKU: {item.sku}</p>
        <div className='space-y-3'>
          <div>
            <label className='text-sm text-gray-600 dark:text-gray-400'>Quantity</label>
            <input
              type='number'
              min='0'
              value={qty}
              onChange={e => setQty(e.target.value)}
              className='mt-1 w-full border border-gray-200 dark:border-gray-700 bg-transparent dark:text-gray-100 rounded-lg px-3 py-2 text-sm'
            />
          </div>
          <div>
            <label className='text-sm text-gray-600 dark:text-gray-400'>Price (₹)</label>
            <input
              type='number'
              min='0'
              step='0.01'
              value={price}
              onChange={e => setPrice(e.target.value)}
              className='mt-1 w-full border border-gray-200 dark:border-gray-700 bg-transparent dark:text-gray-100 rounded-lg px-3 py-2 text-sm'
            />
          </div>
          <div>
            <label className='text-sm text-gray-600 dark:text-gray-400'>Category</label>
            <input
              type='text'
              value={cat}
              onChange={e => setCat(e.target.value)}
              className='mt-1 w-full border border-gray-200 dark:border-gray-700 bg-transparent dark:text-gray-100 rounded-lg px-3 py-2 text-sm'
            />
          </div>
        </div>
        <div className='flex gap-3 mt-5'>
          <button
            onClick={onClose}
            className='flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className='flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50'
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
