import { api } from './api';

// ── Dead Stock Types ─────────────────────────────────────────────
export interface DeadStockItem {
    product_id: string;
    name: string;
    sku: string;
    category?: string;
    current_stock: number;
    unit_price: number;
    blocked_value: number;
    days_without_sale: number | null;   // null = never sold, never 999
    is_dead_stock: boolean;
    ai_suggestion: string | null;
}

export interface DeadStockSummary {
    total_dead_stock: number;
    total_blocked_value: number;
    overstocked: number;
    low_stock: number;
}

export interface DeadStockAnalysis {
    items: DeadStockItem[];
    summary: DeadStockSummary;
}

// ── API Calls ────────────────────────────────────────────────────
export const getDashboardStats = (signal?: AbortSignal, params?: Record<string, any>) =>
    api.get('/dashboard', { signal, params });
export const getHealthScore = (signal?: AbortSignal, params?: Record<string, any>) =>
    api.get('/dashboard/health', { signal, params });
export const getDeadStockAnalysis = (signal?: AbortSignal, params?: Record<string, any>) =>
    api.get<DeadStockAnalysis>('/dashboard/dead-stock-analysis', { signal, params });
