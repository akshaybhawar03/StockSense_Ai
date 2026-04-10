export interface Product {
    id: number;
    name: string;
    sku: string;
    category: string;
    stock: number;
    price: number;
    sales: number;
}

export interface CreateProduct {
    name: string;
    sku: string;
    category: string;
    stock: number;
    price: number;
}

export interface Prediction {
    month: string;
    predictedDemand: number;
    confidence: number;
}

export interface Movement {
    id: number;
    productId: number;
    type: 'IN' | 'OUT';
    quantity: number;
    date: string;
    reason: string;
}

export interface DashboardStats {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
}
