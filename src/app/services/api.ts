import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://stocksense-backend-wijr.onrender.com/api/v1';

// ─── In-memory access token (never in localStorage) ───────────────────────────
let _accessToken: string | null = null;

export function getAccessToken() { return _accessToken; }
export function setAccessToken(token: string | null) { _accessToken = token; }

// ─── Refresh token helpers (localStorage is acceptable for refresh tokens) ────
export function getRefreshToken() { return localStorage.getItem('refresh_token'); }
export function setRefreshToken(token: string | null) {
    if (token) localStorage.setItem('refresh_token', token);
    else localStorage.removeItem('refresh_token');
}

export function clearAuthTokens() {
    _accessToken = null;
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
}

// ─── Axios instance ────────────────────────────────────────────────────────────
export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach in-memory access token ───────────────────────
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Token refresh queue ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    failedQueue = [];
}

// ─── Response interceptor: silent refresh on 401 ──────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh once per request, skip auth endpoints
        const isAuthEndpoint =
            originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/register') ||
            originalRequest?.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                // No refresh token available — send to login
                clearAuthTokens();
                if (window.location.pathname !== '/login') window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(`${API_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const newAccessToken: string = data.access_token;
                const newRefreshToken: string | undefined = data.refresh_token;

                setAccessToken(newAccessToken);
                if (newRefreshToken) setRefreshToken(newRefreshToken);

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAuthTokens();
                if (window.location.pathname !== '/login') window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
