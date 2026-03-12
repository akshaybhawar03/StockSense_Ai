import Dexie, { Table } from 'dexie';

export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string; // Simple mock for authentication
    createdAt: string;
}

export interface InventoryItem {
    id: string;
    userId: string;
    sku: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    sales: number; // Historical aggregate directly from CSV line
    createdAt: string;
    updatedAt: string;
}

export interface SalesRecord {
    id: string;
    userId: string;
    sku: string;
    quantity: number;
    revenue: number;
    date: string;
}

export interface ForecastRecord {
    id: string;
    userId: string;
    sku: string;
    date: string;
    predictedDemand: number;
}

export interface DatasetRecord {
    id: string;
    userId: string;
    name: string;
    fileName: string;
    columns: string[];
    rows: any[];
    createdAt: string;
}

export class StockSenseDatabase extends Dexie {
    users!: Table<User, string>;
    inventory!: Table<InventoryItem, string>;
    sales!: Table<SalesRecord, string>;
    forecasts!: Table<ForecastRecord, string>;
    datasets!: Table<DatasetRecord, string>;

    constructor() {
        super('StockSenseDB');
        this.version(1).stores({
            users: 'id, &email', // Primary key and indexed props, & means unique
            inventory: 'id, userId, sku, [userId+sku], category', // Compound index for fast user-specific lookup
            sales: 'id, userId, sku, [userId+sku], date',
            forecasts: 'id, userId, sku, [userId+sku], date'
        });
        this.version(2).stores({
            users: 'id, &email',
            inventory: 'id, userId, sku, [userId+sku], category',
            sales: 'id, userId, sku, [userId+sku], date',
            forecasts: 'id, userId, sku, [userId+sku], date',
            datasets: 'id, userId, name, createdAt'
        });
    }
}

export const db = new StockSenseDatabase();
