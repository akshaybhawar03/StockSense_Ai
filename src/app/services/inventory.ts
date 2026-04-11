import { api } from './api';

export const getInventory = (params?: any, signal?: AbortSignal) => api.get('/inventory', { params, signal });
export const updateItem = (id: string, data: any) => api.put(`/inventory/${id}`, data);
export const deleteItem = (id: string) => api.delete(`/inventory/${id}`);
export const getCategories = (signal?: AbortSignal) => api.get('/inventory/categories', { signal });
export const uploadInventoryBatch = (data: any[]) => api.post('/inventory/batch', data);
export const recordSale = (data: { product_id: string, quantity: number, sale_price: number, notes?: string }) => api.post('/stock/record-sale', data);
export const uploadCSV = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/inventory/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
