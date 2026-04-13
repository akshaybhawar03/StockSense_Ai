import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { CloudUpload, Package, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock, Activity, RefreshCw, X, Maximize, BarChart3, HelpCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CsvUploadModal } from '../components/dashboard/CsvUploadModal';
import { GlobalCharts } from '../components/dashboard/GlobalCharts';
import { CashFlowOptimizer } from '../components/dashboard/CashFlowOptimizer';
import { DeadStockAnalyzer } from '../components/dashboard/DeadStockAnalyzer';
import { ReorderPredictor } from '../components/dashboard/ReorderPredictor';
import { PowerBIDashboard } from '../components/dashboard/PowerBIDashboard';
import { getDashboardStats, getHealthScore, getDeadStockAnalysis } from '../services/dashboard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { datasets, kpis } = useData();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFullscreenPowerBI, setIsFullscreenPowerBI] = useState(false);
  const queryClient = useQueryClient();

  const formatINR = (val: any) => {
    if (!val && val !== 0) return '₹0.00';
    return '₹' + Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  };

  // React Query: Fetch all 3 dashboard endpoints
  const { data: statsRes, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async ({ signal }) => {
      try {
        const r = await getDashboardStats(signal);
        return r.data;
      } catch (err) {
        toast.error('Failed to load dashboard statistics.');
        throw err;
      }
    },
    staleTime: 60_000,
  });

  const { data: healthData } = useQuery({
    queryKey: ['dashboard', 'health'],
    queryFn: ({ signal }) => getHealthScore(signal).then(r => r.data),
    staleTime: 60_000,
  });

  const { data: deadStockData, isLoading: deadStockLoading, isError: deadStockError } = useQuery({
    queryKey: ['dashboard', 'deadStock'],
    queryFn: ({ signal }) => getDeadStockAnalysis(signal).then(r => r.data),
    staleTime: 60_000,
  });

  const stats = statsRes ?? null;
  const loading = statsLoading;

  // Invalidate dashboard queries when CSV is uploaded
  const handleCsvUploaded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener('csv-uploaded', handleCsvUploaded);
    return () => {
      window.removeEventListener('csv-uploaded', handleCsvUploaded);
    };
  }, [handleCsvUploaded]);

  const statCards = [
    { label: 'Total Products', value: (stats?.total_products || kpis?.totalProducts || 0).toLocaleString('en-IN'), icon: Package, accent: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Inventory Value', value: parseFloat(stats?.inventory_value ?? kpis?.inventoryValue ?? 0) === 0 ? '₹0.00' : formatINR(stats?.inventory_value ?? kpis?.inventoryValue), icon: DollarSign, accent: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Low Stock Items', value: (stats?.low_stock_items ?? kpis?.lowStock ?? 0).toLocaleString('en-IN'), icon: AlertTriangle, accent: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', warning: (stats?.low_stock_items || kpis?.lowStock || 0) > 0 },
    { label: 'Out of Stock', value: (stats?.out_of_stock ?? kpis?.outOfStock ?? 0).toLocaleString('en-IN'), icon: TrendingDown, accent: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', danger: (stats?.out_of_stock || kpis?.outOfStock || 0) > 0 },
    { label: 'Dead Stock Items', value: ((stats as any)?.dead_stock_items ?? (stats as any)?.deadStock ?? (stats as any)?.dead_stock ?? deadStockData?.summary?.total_dead_stock ?? (deadStockData as any)?.dead_stock_items ?? kpis?.deadStock ?? 0).toLocaleString('en-IN'), icon: Clock, accent: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { 
      label: 'Total Sales', 
      value: (parseFloat(stats?.total_sales ?? kpis?.totalSales ?? 0) === 0) ? 'No sales yet' : (stats?.total_sales ?? kpis?.totalSales ?? 0).toLocaleString('en-IN'), 
      icon: Activity, accent: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      label: 'Monthly Revenue', 
      value: (parseFloat(stats?.monthly_revenue ?? kpis?.monthlyRevenue ?? 0) === 0) ? 'No revenue this month' : formatINR(stats?.monthly_revenue ?? kpis?.monthlyRevenue), 
      icon: TrendingUp, accent: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      label: 'Turnover Rate', 
      value: (stats?.total_sales ?? kpis?.totalSales ?? 0) === 0 
        ? 'Start recording sales to see turnover rate' 
        : `${(parseFloat(stats?.turnover_rate ?? kpis?.turnoverRate ?? 0) * 100).toFixed(1)}%`,
      icon: RefreshCw, accent: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20',
      tooltip: 'How quickly your inventory is sold and replaced. Higher is better.'
    },
  ];

  const total = stats?.total_products || kpis?.totalProducts || 1;
  const healthy = total - (stats?.out_of_stock ?? kpis?.outOfStock ?? 0) - (stats?.low_stock_items ?? kpis?.lowStock ?? 0);
  const segments = [
    { label: 'Healthy', value: healthy, color: '#10b981' },
    { label: 'Low Stock', value: stats?.low_stock_items ?? kpis?.lowStock ?? 0, color: '#f59e0b' },
    { label: 'Out of Stock', value: stats?.out_of_stock ?? kpis?.outOfStock ?? 0, color: '#ef4444' },
    { label: 'Dead Stock', value: (stats as any)?.dead_stock_items ?? (stats as any)?.deadStock ?? (stats as any)?.dead_stock ?? deadStockData?.summary?.total_dead_stock ?? (deadStockData as any)?.dead_stock_items ?? kpis?.deadStock ?? 0, color: '#6b7280' },
  ];

  // Show skeleton UI only if completely empty and no local KPI data
  if (loading && !stats && !kpis?.totalProducts) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 relative">
      <AnimatePresence>
        {isFullscreenPowerBI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 overflow-y-auto w-full h-full"
          >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-full">
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mx-auto w-full">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-green-500" />
                  Full Screen Data Visualization
                </h2>
                <button
                  onClick={() => setIsFullscreenPowerBI(false)}
                  className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                  <X className="w-5 h-5" />
                  Exit Full Screen
                </button>
              </div>
              <PowerBIDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {statsError ? (
        <Card className="p-8 border border-red-200 dark:border-red-800 shadow-sm bg-red-50 dark:bg-red-900/10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            There was an error communicating with the server. Your data couldn't be loaded at this time.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </Card>
      ) : !stats || stats.total_products === 0 ? (
        datasets && datasets.length > 0 ? (
          <PowerBIDashboard />
        ) : (
          <Card className="p-8 border border-dashed border-gray-300 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <CloudUpload className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Data Found</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Upload your inventory Excel or CSV file to instantly generate AI-driven insights, forecasts, and powerful analytics.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Upload Inventory Data
            </button>
          </Card>
        )
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{stats?.warehouse_name || 'Overview'}</h2>
            {datasets && datasets.length > 0 && (
              <button
                onClick={() => setIsFullscreenPowerBI(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <BarChart3 className="w-4 h-4" />
                View Raw Data Dashboard
              </button>
            )}
          </div>

          {/* Dynamic KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TooltipProvider>
              {statCards.map((stat: any, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={`p-5 border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative overflow-hidden group h-full`}
                    style={{ borderLeft: stat.danger ? '3px solid #ef4444' : stat.warning ? '3px solid #f59e0b' : undefined }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                          {stat.tooltip && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-green-500 cursor-help transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 text-white max-w-[200px] text-xs">
                                <p>{stat.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 break-words leading-tight">{stat.value}</h3>
                      </div>
                      <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${stat.bg} ${stat.accent} transition-transform group-hover:scale-110`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </TooltipProvider>
          </div>

<div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Stock health overview
              </p>
              <div className="flex h-3 rounded-full overflow-hidden gap-1 bg-gray-100 dark:bg-gray-700 mb-4">
                {segments.map((s, i) => (
                  <div key={i} style={{
                    flex: s.value / total,
                    background: s.color,
                    minWidth: s.value > 0 ? 4 : 0,
                    transition: 'flex 0.6s ease'
                  }} />
                ))}
              </div>
              <div className="flex gap-6 flex-wrap">
                {segments.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div style={{ background: s.color }} className="w-2.5 h-2.5 rounded-full shadow-sm" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {s.label}: <strong className="text-gray-900 dark:text-white">{s.value || 0}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Global Overview Charts */}
          <GlobalCharts stats={stats} />

          {/* Smart Modules — data passed as props (fetched in parallel) */}
          <CashFlowOptimizer healthData={healthData} />
          <DeadStockAnalyzer deadStockData={deadStockData} isLoading={deadStockLoading} isError={deadStockError} />
          <ReorderPredictor />
        </>
      )}

      <CsvUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
