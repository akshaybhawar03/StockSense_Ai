// Mock data for the SmartGodown application

export const salesForecastData = [
  { date: 'Feb 1', actual: 45000, predicted: 47000 },
  { date: 'Feb 5', actual: 52000, predicted: 51000 },
  { date: 'Feb 10', actual: 48000, predicted: 49000 },
  { date: 'Feb 15', actual: 61000, predicted: 62000 },
  { date: 'Feb 20', actual: null, predicted: 58000 },
  { date: 'Feb 25', actual: null, predicted: 65000 },
  { date: 'Mar 1', actual: null, predicted: 71000 },
];

export const categoryDemandData = [
  { category: 'Electronics', demand: 4500, growth: 12 },
  { category: 'Fashion', demand: 3800, growth: 8 },
  { category: 'Home', demand: 2900, growth: -3 },
  { category: 'Beauty', demand: 3200, growth: 15 },
  { category: 'Sports', demand: 2100, growth: 5 },
];

export const revenueData = [
  { month: 'Sep', revenue: 125000, profit: 35000 },
  { month: 'Oct', revenue: 142000, profit: 41000 },
  { month: 'Nov', revenue: 158000, profit: 47000 },
  { month: 'Dec', revenue: 189000, profit: 58000 },
  { month: 'Jan', revenue: 176000, profit: 52000 },
  { month: 'Feb', revenue: 195000, profit: 61000 },
];

export const stockTurnoverData = [
  { name: 'Fast Moving', value: 45, color: '#10b981' },
  { name: 'Medium Moving', value: 35, color: '#f59e0b' },
  { name: 'Slow Moving', value: 15, color: '#ef4444' },
  { name: 'Dead Stock', value: 5, color: '#6b7280' },
];

export const bestSellingProducts = [
  { 
    id: 1, 
    name: 'Premium Wireless Headphones', 
    sku: 'ELC-WH-001', 
    sold: 234, 
    revenue: 234000, 
    stock: 45, 
    status: 'fast', 
    trend: 'up',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
  },
  { 
    id: 2, 
    name: 'Smart Fitness Watch', 
    sku: 'ELC-SW-022', 
    sold: 189, 
    revenue: 189000, 
    stock: 23, 
    status: 'fast', 
    trend: 'up',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
  },
  { 
    id: 3, 
    name: 'Yoga Mat Premium', 
    sku: 'SPT-YM-015', 
    sold: 156, 
    revenue: 78000, 
    stock: 67, 
    status: 'fast', 
    trend: 'stable',
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&h=200&fit=crop'
  },
  { 
    id: 4, 
    name: 'Organic Face Cream', 
    sku: 'BTY-FC-088', 
    sold: 142, 
    revenue: 142000, 
    stock: 89, 
    status: 'medium', 
    trend: 'up',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop'
  },
  { 
    id: 5, 
    name: 'Cotton T-Shirt Pack', 
    sku: 'FSN-TS-043', 
    sold: 128, 
    revenue: 64000, 
    stock: 156, 
    status: 'medium', 
    trend: 'down',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  },
];

export const deadStockProducts = [
  { 
    id: 1, 
    name: 'Winter Jacket Heavy', 
    sku: 'FSN-WJ-092', 
    stock: 145, 
    value: 435000, 
    daysStagnant: 120, 
    recommendation: 'Discount 40%',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop'
  },
  { 
    id: 2, 
    name: 'Old Model Phone Case', 
    sku: 'ELC-PC-156', 
    stock: 234, 
    value: 117000, 
    daysStagnant: 95, 
    recommendation: 'Bundle Deal',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&h=200&fit=crop'
  },
  { 
    id: 3, 
    name: 'Seasonal Decoration', 
    sku: 'HOM-SD-078', 
    stock: 89, 
    value: 89000, 
    daysStagnant: 180, 
    recommendation: 'Clearance Sale',
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=200&h=200&fit=crop'
  },
];

export const reorderRequired = [
  { 
    id: 1, 
    name: 'Premium Wireless Headphones', 
    sku: 'ELC-WH-001', 
    currentStock: 45, 
    reorderPoint: 50, 
    suggestedOrder: 200, 
    leadTime: '7 days',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
  },
  { 
    id: 2, 
    name: 'Smart Fitness Watch', 
    sku: 'ELC-SW-022', 
    currentStock: 23, 
    reorderPoint: 40, 
    suggestedOrder: 150, 
    leadTime: '10 days',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
  },
  { 
    id: 3, 
    name: 'Protein Powder 1kg', 
    sku: 'SPT-PP-091', 
    currentStock: 12, 
    reorderPoint: 30, 
    suggestedOrder: 100, 
    leadTime: '5 days',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=200&h=200&fit=crop'
  },
];
