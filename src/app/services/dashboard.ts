import { api } from './api';

export const getDashboardStats = (signal?: AbortSignal) => api.get('/dashboard', { signal });
export const getHealthScore = (signal?: AbortSignal) => api.get('/dashboard/health', { signal });
export const getDeadStockAnalysis = (signal?: AbortSignal) => api.get('/dashboard/dead-stock-analysis', { signal });
