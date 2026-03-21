import { api } from './api';

export const runAnalysis = () => api.get('/api/ai/analyse');
export const getLowStockInsight = () => api.get('/api/ai/insights/low-stock');
export const getDeadStockInsight = () => api.get('/api/ai/insights/dead-stock');
export const getAlerts = () => api.get('/api/alerts');
export const chat = (messages: any[]) => api.post('/api/ai/chat', { messages });

export const streamAnalysis = () => {
    const token = localStorage.getItem('access_token');
    const base = import.meta.env.VITE_API_URL || 'https://stocksense-backend-wijr.onrender.com';
    return new EventSource(`${base}/api/ai/analyse/stream?token=${token}`);
};
