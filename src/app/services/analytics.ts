import { api } from './api';
export const getAnalytics = (params?: Record<string, any>, signal?: AbortSignal) =>
    api.get('/analytics', { signal, params });
export const getLocationComparison = (params?: { from_date?: string; to_date?: string }) =>
    api.get('/analytics/location-comparison', { params });
