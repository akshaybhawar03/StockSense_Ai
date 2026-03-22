import { api } from './api';

export const getDashboardStats = () => api.get('/dashboard');
export const getHealthScore = () => api.get('/dashboard/health');
export const getDeadStockAnalysis = () => api.get('/dashboard/dead-stock-analysis');
