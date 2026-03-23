import api from '../app/services/api';

export const getProfile = () => api.get('/profile');
export const updateProfile = (data: any) => api.put('/profile', data);
