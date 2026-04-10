/// <reference types="vite/client" />
import { CreateProduct } from '../types/inventory';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
    products: {
        list: (page = 1, lowStock?: boolean) => `${API_BASE}/products?page=${page}${lowStock !== undefined ? `&low_stock=${lowStock}` : ''}`,
        create: () => [API_BASE, 'products'].join('/'),
        update: (id: number) => [API_BASE, 'products', id].join('/'),
        delete: (id: number) => [API_BASE, 'products', id].join('/'),
    },
    predict: (productId: number) => [API_BASE, 'inventory', productId, 'predict'].join('/'),
    movements: `${API_BASE}/inventory/movements`,
    stats: `${API_BASE}/dashboard/stats`
};

export const fetchProducts = async (page = 1, lowStock?: boolean) => {
    // In a real app we would call:
    // const res = await fetch(api.products.list(page, lowStock));
    // return res.json();

    // Using mock data for immediate UI rendering
    return {
        data: [
            { id: 1, name: "Premium Wireless Headphones", sku: "WH-1000", category: "Electronics", stock: 120, price: 14999, sales: 450 },
            { id: 2, name: "Ergonomic Office Chair", sku: "OC-Pro", category: "Furniture", stock: 5, price: 8500, sales: 120 },
            { id: 3, name: "Smart Fitness Watch", sku: "FW-200", category: "Electronics", stock: 0, price: 4999, sales: 890 },
            { id: 4, name: "Mechanical Keyboard", sku: "MK-87", category: "Accessories", stock: 45, price: 6500, sales: 340 },
            { id: 5, name: "4K Web Camera", sku: "WC-4K", category: "Electronics", stock: 8, price: 3200, sales: 210 },
        ].filter(p => {
            if (lowStock) return p.stock <= 10;
            return true;
        }),
        total: 5,
        page,
        totalPages: 1
    };
};

export const createProduct = async (data: CreateProduct) => {
    console.log("Mock Create Product", api.products.create(), data);
    return { ...data, id: Math.random() };
}

export const updateProduct = async (id: number, data: Partial<CreateProduct>) => {
    console.log("Mock Update Product", api.products.update(id), data);
    return { id, ...data };
}

export const deleteProductBulk = async (ids: number[]) => {
    console.log("Mock Delete Bulk", ids);
    return true;
}

export const fetchPrediction = async (productId: number) => {
    console.log("Mock Fetch Prediction", api.predict(productId));
    return [
        { month: 'Jan', predictedDemand: 400, actual: 380 },
        { month: 'Feb', predictedDemand: 300, actual: 310 },
        { month: 'Mar', predictedDemand: 500, actual: 480 },
        { month: 'Apr', predictedDemand: 200, actual: null },
        { month: 'May', predictedDemand: 600, actual: null },
        { month: 'Jun', predictedDemand: 450, actual: null },
    ];
};

export const fetchStats = async () => {
    console.log("Mock Fetch Stats", api.stats);
    return {
        totalProducts: 1245,
        totalValue: 4500000,
        lowStockCount: 23,
        outOfStockCount: 5
    };
};

export const fetchMovements = async () => {
    console.log("Mock Fetch Movements", api.movements);
    return [
        { id: 1, productId: 1, type: 'IN', quantity: 50, date: '2023-10-25T10:00:00Z', reason: 'Restock' },
        { id: 2, productId: 2, type: 'OUT', quantity: 5, date: '2023-10-26T14:30:00Z', reason: 'Sales Order #1042' },
        { id: 3, productId: 3, type: 'IN', quantity: 100, date: '2023-10-27T09:15:00Z', reason: 'Initial Stock' },
    ];
};
