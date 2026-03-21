import { api } from './api';

export interface GetInventoryParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export const getInventory = (params?: GetInventoryParams) => 
  api.get('/inventory', { params });

export const updateItem = (id: string, data: { quantity?: number; price?: number; category?: string; }) => 
  api.put(`/inventory/${id}`, data);

export const deleteItem = (id: string) => 
  api.delete(`/inventory/${id}`);

export const getCategories = () => 
  api.get('/inventory/categories');

export const uploadInventoryBatch = (data: any[]) =>
  api.post('/inventory/batch', data);
