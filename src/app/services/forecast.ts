import { api } from './api';
export const getForecast = () => api.get('/api/forecast');
