import { api } from './api';

export interface LocationPayload {
  name: string;
  type: 'warehouse' | 'shop' | 'store';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pin_code?: string;
  is_active: boolean;
}

export const getLocations = (params?: { include_inactive?: boolean }) =>
  api.get('/locations/', { params });

export const getLocation = (id: string) =>
  api.get(`/locations/${id}`);

export const getLocationStats = (id: string) =>
  api.get(`/locations/${id}/stats`);

export const getLocationInventory = (id: string, params?: { category?: string; search?: string; page?: number; page_size?: number }) =>
  api.get(`/locations/${id}/inventory`, { params });

export const createLocation = (data: LocationPayload) =>
  api.post('/locations/', data);

export const updateLocation = (id: string, data: Partial<LocationPayload>) =>
  api.put(`/locations/${id}`, data);

export const deactivateLocation = (id: string) =>
  api.delete(`/locations/${id}`);

export const getLocationsSummary = () =>
  api.get('/dashboard/locations-summary');
