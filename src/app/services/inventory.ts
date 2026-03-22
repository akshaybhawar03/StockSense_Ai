import { api } from './api';

export const getInventory = (params?: any) => api.get('/inventory', { params });
export const updateItem = (id: string, data: any) => api.put(`/inventory/${id}`, data);
export const deleteItem = (id: string) => api.delete(`/inventory/${id}`);
export const getCategories = () => api.get('/inventory/categories');
export const uploadInventoryBatch = (data: any[]) => api.post('/inventory/batch', data);
export const uploadCSV = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/inventory/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
