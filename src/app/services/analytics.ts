import { api } from './api';
export const getAnalytics = (signal?: AbortSignal) => api.get('/analytics', { signal });
