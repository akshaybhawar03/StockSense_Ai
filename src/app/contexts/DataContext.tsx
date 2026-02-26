import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, InventoryItem, SalesRecord, ForecastRecord } from '../lib/db';
import { useAuth } from './AuthContext';

interface GlobalKPIs {
    totalProducts: number;
    inventoryValue: number;
    lowStock: number;
    outOfStock: number;
    deadStock: number;
    totalSales: number;
    monthlyRevenue: number;
    turnoverRate: number;
}

interface DataContextType {
    inventory: InventoryItem[];
    sales: SalesRecord[];
    forecasts: ForecastRecord[];
    kpis: GlobalKPIs;
    refreshData: () => Promise<void>;
    isLoadingData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [sales, setSales] = useState<SalesRecord[]>([]);
    const [forecasts, setForecasts] = useState<ForecastRecord[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [kpis, setKpis] = useState<GlobalKPIs>({
        totalProducts: 0,
        inventoryValue: 0,
        lowStock: 0,
        outOfStock: 0,
        deadStock: 0,
        totalSales: 0,
        monthlyRevenue: 0,
        turnoverRate: 0,
    });

    const refreshData = useCallback(async () => {
        if (!user) return;
        setIsLoadingData(true);
        try {
            const userId = user.id;
            const invData = await db.inventory.where('userId').equals(userId).toArray();
            const salesData = await db.sales.where('userId').equals(userId).toArray();
            const forecastData = await db.forecasts.where('userId').equals(userId).toArray();

            setInventory(invData);
            setSales(salesData);
            setForecasts(forecastData);

            // Calculate KPIs
            const totalProducts = invData.length;
            const inventoryValue = invData.reduce((sum, item) => sum + (item.stock * item.price), 0);
            const lowStock = invData.filter(item => item.stock > 0 && item.stock <= 10).length;
            const outOfStock = invData.filter(item => item.stock === 0).length;

            // Assuming dead stock = high stock but 0 sales
            const deadStock = invData.filter(item => item.stock > 20 && item.sales === 0).length;

            const totalSales = invData.reduce((sum, item) => sum + item.sales, 0);

            // Calculate monthly revenue from sales records for the current month
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = salesData
                .filter(sale => {
                    const d = new Date(sale.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((sum, sale) => sum + sale.revenue, 0);

            // Turnover Rate (COGS / Average Inventory) roughly simulated here
            const turnoverRate = inventoryValue > 0 ? Number(((totalSales * 15) / inventoryValue).toFixed(2)) : 0; // Simple mock calculation

            setKpis({
                totalProducts,
                inventoryValue,
                lowStock,
                outOfStock,
                deadStock,
                totalSales,
                monthlyRevenue,
                turnoverRate
            });

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoadingData(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            refreshData();
        } else {
            setInventory([]);
            setSales([]);
            setForecasts([]);
            setIsLoadingData(false);
        }
    }, [user, refreshData]);

    return (
        <DataContext.Provider value={{ inventory, sales, forecasts, kpis, refreshData, isLoadingData }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
