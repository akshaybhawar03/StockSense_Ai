import { api } from './api';

export const runAnalysis = () => api.get('/ai/analyse');
export const getLowStockInsight = () => api.get('/ai/insights/low-stock');
export const getDeadStockInsight = () => api.get('/ai/insights/dead-stock');
export const getAlerts = () => api.get('/alerts');
export const chat = (messages: any[]) => api.post('/ai/chat', { messages });

export const streamAnalysis = () => {
    const token = localStorage.getItem('access_token');
    const base = import.meta.env.VITE_API_URL || 'https://stocksense-backend-wijr.onrender.com/api/v1';
    return new EventSource(`${base}/ai/analyse/stream?token=${token}`);
};
