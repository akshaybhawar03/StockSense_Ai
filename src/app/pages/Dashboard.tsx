import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { CloudUpload, Package, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock, Building2, Activity, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CsvUploadModal } from '../components/dashboard/CsvUploadModal';
import { GlobalCharts } from '../components/dashboard/GlobalCharts';
import { CashFlowOptimizer } from '../components/dashboard/CashFlowOptimizer';
import { DeadStockAnalyzer } from '../components/dashboard/DeadStockAnalyzer';
import { ReorderPredictor } from '../components/dashboard/ReorderPredictor';

export function Dashboard() {
  const { kpis, inventory, isLoadingData } = useData();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const stats = [
    { label: 'Total Products', value: kpis.totalProducts.toLocaleString(), icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Inventory Value', value: `$${kpis.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Low Stock Items', value: kpis.lowStock.toLocaleString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Out of Stock', value: kpis.outOfStock.toLocaleString(), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Dead Stock Items', value: kpis.deadStock.toLocaleString(), icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Sales', value: kpis.totalSales.toLocaleString(), icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Monthly Revenue', value: `$${kpis.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Turnover Rate', value: `${kpis.turnoverRate}%`, icon: RefreshCw, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  ];

  if (isLoadingData) {
    return <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">Loading your data...</div>;
  }

  return (
    <div className="flex flex-col gap-6">

      {inventory.length === 0 ? (
        <Card className="p-8 border border-dashed border-gray-300 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
            <CloudUpload className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Data Found</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Upload your inventory CSV file to instantly generate AI-driven insights, forecasts, and powerful analytics.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Upload Inventory Data
          </button>
        </Card>
      ) : (
        <>
          {/* Dynamic KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-5 border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Global Overview Charts */}
          <GlobalCharts />

          {/* Smart Modules */}
          <CashFlowOptimizer />
          <DeadStockAnalyzer />
          <ReorderPredictor />
        </>
      )}

      <CsvUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}


