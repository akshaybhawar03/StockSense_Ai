import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/card';
import { CloudUpload, Package, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock, Activity, RefreshCw, X, Maximize, BarChart3 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CsvUploadModal } from '../components/dashboard/CsvUploadModal';
import { GlobalCharts } from '../components/dashboard/GlobalCharts';
import { CashFlowOptimizer } from '../components/dashboard/CashFlowOptimizer';
import { DeadStockAnalyzer } from '../components/dashboard/DeadStockAnalyzer';
import { ReorderPredictor } from '../components/dashboard/ReorderPredictor';
import { PowerBIDashboard } from '../components/dashboard/PowerBIDashboard';
import { StockAIChat } from '../components/StockAIChat';
import { getDashboardStats, getHealthScore, getDeadStockAnalysis } from '../services/dashboard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { datasets } = useData();
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
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: ({ signal }) => getDashboardStats(signal).then(r => r.data),
    staleTime: 60_000,
  });

  const { data: healthData } = useQuery({
    queryKey: ['dashboard', 'health'],
    queryFn: ({ signal }) => getHealthScore(signal).then(r => r.data),
    staleTime: 60_000,
  });

  const { data: deadStockData } = useQuery({
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
    { label: 'Total Products', value: (stats?.total_products || 0).toLocaleString(), icon: Package, accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Inventory Value', value: formatINR(stats?.inventory_value), icon: DollarSign, accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Low Stock Items', value: (stats?.low_stock_items || 0).toLocaleString(), icon: AlertTriangle, accent: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', warning: (stats?.low_stock_items || 0) > 0 },
    { label: 'Out of Stock', value: (stats?.out_of_stock || 0).toLocaleString(), icon: TrendingDown, accent: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', danger: (stats?.out_of_stock || 0) > 0 },
    { label: 'Dead Stock Items', value: (stats?.dead_stock_items || 0).toLocaleString(), icon: Clock, accent: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Sales', value: (stats?.total_sales || 0).toLocaleString(), icon: Activity, accent: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Monthly Revenue', value: formatINR(stats?.monthly_revenue), icon: TrendingUp, accent: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Turnover Rate', value: `${stats?.turnover_rate || 0}%`, icon: RefreshCw, accent: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  ];

  const total = stats?.total_products || 1;
  const healthy = total - (stats?.out_of_stock || 0) - (stats?.low_stock_items || 0);
  const segments = [
    { label: 'Healthy', value: healthy, color: '#10b981' },
    { label: 'Low Stock', value: stats?.low_stock_items, color: '#f59e0b' },
    { label: 'Out of Stock', value: stats?.out_of_stock, color: '#ef4444' },
    { label: 'Dead Stock', value: stats?.dead_stock_items, color: '#6b7280' },
  ];

  // Show skeleton UI while loading
  if (loading) {
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
                  <Maximize className="w-5 h-5 text-teal-500" />
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

      {!stats || stats.total_products === 0 ? (
        datasets && datasets.length > 0 ? (
          <PowerBIDashboard />
        ) : (
          <Card className="p-8 border border-dashed border-gray-300 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
              <CloudUpload className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Data Found</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Upload your inventory Excel or CSV file to instantly generate AI-driven insights, forecasts, and powerful analytics.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
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
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <BarChart3 className="w-4 h-4" />
                View Raw Data Dashboard
              </button>
            )}
          </div>

          {/* Dynamic KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat: any, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`p-5 border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative overflow-hidden group`}
                  style={{ borderLeft: stat.danger ? '3px solid #ef4444' : stat.warning ? '3px solid #f59e0b' : undefined }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.accent} transition-transform group-hover:scale-110`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div style={{
            background: '#0f172a', borderRadius: 12, padding: '16px 20px',
            border: '1px solid #1e293b', marginBottom: 24
          }}>
            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 10 }}>
              Stock health overview
            </p>
            <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', gap: 2 }}>
              {segments.map((s, i) => (
                <div key={i} style={{
                  flex: s.value / total,
                  background: s.color,
                  minWidth: s.value > 0 ? 4 : 0,
                  transition: 'flex 0.6s ease'
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {segments.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: s.color
                  }} />
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>
                    {s.label}: <strong style={{ color: 'white' }}>{s.value || 0}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Global Overview Charts */}
          <GlobalCharts stats={stats} />

          {/* Smart Modules — data passed as props (fetched in parallel) */}
          <CashFlowOptimizer healthData={healthData} />
          <DeadStockAnalyzer deadStockData={deadStockData} />
          <ReorderPredictor />

          {/* AI Stock Assistant */}
          <div className="mt-6">
            <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">AI Stock Assistant</h2>
            <StockAIChat />
          </div>
        </>
      )}

      <CsvUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
