import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://stock-sense-ai-sooty.vercel.app/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the standard token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors like 401
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and optional redirect
            localStorage.removeItem('access_token');
            localStorage.removeItem('userEmail');

            // If we aren't already on login/register, reload to force the AuthContext to catch the missing token
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
