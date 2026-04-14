import { api } from './api';

export interface SalePayload {
    product_id: string;
    quantity: number;
    sale_price: number;
    customer_name?: string;
    date: string;
}

export interface PurchasePayload {
    product_id: string;
    quantity: number;
    purchase_price: number;
    supplier_name?: string;
    date: string;
}

export const getSales      = (signal?: AbortSignal) => api.get('/sales/', { signal });
export const createSale    = (data: SalePayload)    => api.post('/sales/', data);

export const getPurchases   = (signal?: AbortSignal) => api.get('/purchases/', { signal });
export const createPurchase = (data: PurchasePayload) => api.post('/purchases/', data);

export const getInvoices    = (signal?: AbortSignal) => api.get('/invoices/', { signal });
export const downloadInvoice = (id: string)          =>
    api.get(`/invoices/${id}/download`, { responseType: 'blob' });
