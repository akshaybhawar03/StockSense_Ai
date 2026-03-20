import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'https://stocksense-backend-wijr.onrender.com/api/v1';

export const runAnalysis = () => api.get('/ai/analyse');
export const getLowStockInsight = () => api.get('/ai/insights/low-stock');
export const getDeadStockInsight = () => api.get('/ai/insights/dead-stock');
export const getAlerts = () => api.get('/alerts');

export const streamAnalysis = (): EventSource => {
    const token = localStorage.getItem('access_token');
    return new EventSource(`${API_URL}/ai/analyse/stream?token=${token}`);
};

export const chat = (messages: { role: string; content: string; }[]) => 
    api.post('/ai/chat', { messages });
