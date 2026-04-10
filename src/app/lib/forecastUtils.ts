import { InventoryItem } from './db';

export interface ForecastDataPoint {
  week: string;
  projected: number;
  actual?: number;
  isAIGenerated: boolean;
  [category: string]: any; // For "Per Category" view
}

export function generateBaselineForecast(
  products: InventoryItem[],
  weeksCount: number = 6
): ForecastDataPoint[] {
  const categoryTurnoverDays: Record<string, number> = {
    'Electronics': 45,
    'Software': 30,
    'Accessories': 20,
    'Cables': 60,
    'Stationery': 90,
    'Default': 45,
  };

  const today = new Date();
  const weeks = Array.from({ length: weeksCount }, (_, i) => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + i * 7);
    return weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  });

  // Calculate projected weekly demand per product category
  const categoryDemand = products.reduce((acc, product) => {
    const turnoverDays = categoryTurnoverDays[product.category] ?? categoryTurnoverDays['Default'];
    const weeklyRate = (product.stock / turnoverDays) * 7;
    acc[product.category] = (acc[product.category] ?? 0) + weeklyRate;
    return acc;
  }, {} as Record<string, number>);

  // Generate N-week forecast with slight trend variation
  return weeks.map((week, i) => {
    const trendFactor = 1 + (i * 0.02); // 2% weekly growth assumption
    const noise = 0.9 + Math.random() * 0.2; // ±10% variation
    
    // Create base data point
    const dataPoint: ForecastDataPoint = {
      week,
      projected: Math.round(
        Object.values(categoryDemand).reduce((a, b) => a + b, 0) * trendFactor * noise
      ),
      isAIGenerated: true,
    };

    // Add individual category projections for the "Per Category" view
    Object.keys(categoryDemand).forEach(category => {
      dataPoint[category] = Math.round(categoryDemand[category] * trendFactor * noise);
    });

    return dataPoint;
  });
}

export interface ReorderRecommendation {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  weeklyDemand: number;
  daysUntilStockout: number;
  recommendedOrderQty: number;
}

export function generateReorderRecommendations(products: InventoryItem[]): ReorderRecommendation[] {
  const categoryTurnoverDays: Record<string, number> = {
    'Electronics': 45,
    'Software': 30,
    'Accessories': 20,
    'Cables': 60,
    'Stationery': 90,
    'Default': 45,
  };

  const recommendations = products.map(product => {
    const turnoverDays = categoryTurnoverDays[product.category] ?? categoryTurnoverDays['Default'];
    const weeklyDemandRate = (product.stock / turnoverDays) * 7;
    
    // Prevent divide by zero if demand is 0
    const safeWeeklyDemand = weeklyDemandRate > 0 ? weeklyDemandRate : 0.1; 
    let daysUntilStockout = product.stock / (safeWeeklyDemand / 7);

    // If stock is 0, they are out of stock right now. Let it be 0.
    if (product.stock === 0) daysUntilStockout = 0;

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      currentStock: product.stock,
      weeklyDemand: Math.round(weeklyDemandRate * 10) / 10, // Round to 1 decimal JS
      daysUntilStockout: Math.round(daysUntilStockout),
      recommendedOrderQty: Math.max(Math.round(weeklyDemandRate * 4), 10) // Recommend at least 4 weeks of stock, min 10
    };
  });

  return recommendations.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout).slice(0, 10);
}
