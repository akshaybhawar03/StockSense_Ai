import { api } from './api';

export const getInventory = (params?: any) => api.get('/api/inventory', { params });
export const updateItem = (id: string, data: any) => api.put(`/api/inventory/${id}`, data);
export const deleteItem = (id: string) => api.delete(`/api/inventory/${id}`);
export const getCategories = () => api.get('/api/inventory/categories');
export const uploadInventoryBatch = (data: any[]) => api.post('/api/inventory/batch', data);
