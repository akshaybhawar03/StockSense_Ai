import { api } from './api';
export const getForecast = (signal?: AbortSignal) => api.get('/forecast', { signal });
