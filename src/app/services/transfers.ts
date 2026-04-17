import { api } from './api';

export interface TransferPayload {
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  transfer_date: string;
  note?: string;
}

export interface TransferResponse {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  product_category?: string;
  from_location_id: string;
  from_location_name: string;
  to_location_id: string;
  to_location_name: string;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled';
  transfer_date: string;
  created_at: string;
  note?: string;
}

export const getTransfers = (params?: {
  location_id?: string;
  status?: string;
  product_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}) => api.get('/transfers/', { params });

export const getTransfer = (id: string) =>
  api.get(`/transfers/${id}`);

export const createTransfer = (data: TransferPayload) =>
  api.post('/transfers/', data);

export const cancelTransfer = (id: string) =>
  api.post(`/transfers/${id}/cancel`);

export const getLocationStock = (locationId: string, productId: string) =>
  api.get('/inventory', { params: { location_id: locationId, product_id: productId, page_size: 1 } });
