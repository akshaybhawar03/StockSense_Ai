import { useState, useCallback, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import {
    LayoutDashboard,
    Package,
    TrendingUp,
    Bot,
    Bell,
    Plug,
    Settings,
    ChevronRight,
    LogOut,
    Menu,
    X,
    UploadCloud,
    Sparkles,
    BarChart3,
    ShoppingCart,
    ShoppingBag,
    FileText,
    Receipt,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { triggerScan } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { CsvUploadModal } from './CsvUploadModal';
import { ChatPanel } from '../ai/ChatPanel';
import { GlobalLoadingBar } from '../GlobalLoadingBar';
import { useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, getHealthScore, getDeadStockAnalysis } from '../../services/dashboard';
import { getInventory } from '../../services/inventory';
import { getForecast } from '../../services/forecast';
import { getAnalytics } from '../../services/analytics';
import { getAlerts } from '../../services/ai';
import { getSales, getPurchases, getInvoices } from '../../services/sales';

// Map nav paths to their prefetch configs
const prefetchMap: Record<string, { queryKey: any[]; queryFn: () => Promise<any> }[]> = {
    '/dashboard': [
        { queryKey: ['dashboard', 'stats'], queryFn: () => getDashboardStats().then(r => r.data) },
        { queryKey: ['dashboard', 'health'], queryFn: () => getHealthScore().then(r => r.data) },
        { queryKey: ['dashboard', 'deadStock'], queryFn: () => getDeadStockAnalysis().then(r => r.data) },
    ],
    '/dashboard/inventory': [
        {
            queryKey: ['inventory', 'list', { search: '', category: '', status: '', page: 1, sortField: 'name', sortOrder: 'asc' }],
            queryFn: () => getInventory({ page: 1, page_size: 50, sort_by: 'name', sort_dir: 'asc' }).then(res => {
                const data = res.data;
                const itemsList = data.items || data.data || data.products || [];
                const totalCount = data.total || data.count || itemsList.length;
                return { items: itemsList, total: totalCount };
            }),
        },
    ],
    '/dashboard/forecast': [
        { queryKey: ['forecast', 'weekly'], queryFn: () => getForecast().then(r => r.data) },
    ],
    '/dashboard/analytics': [
        { queryKey: ['analytics', 'overview'], queryFn: () => getAnalytics().then(r => r.data) },
    ],
    '/dashboard/alerts': [
        { queryKey: ['alerts', 'active'], queryFn: () => getAlerts().then(r => r.data) },
    ],
    '/dashboard/sales': [
        { queryKey: ['sales', 'list'], queryFn: () => getSales().then(r => {
            const d = r.data;
            return Array.isArray(d) ? d : (d.items ?? d.data ?? d.sales ?? []);
        }) },
    ],
    '/dashboard/purchases': [
        { queryKey: ['purchases', 'list'], queryFn: () => getPurchases().then(r => {
            const d = r.data;
            return Array.isArray(d) ? d : (d.items ?? d.data ?? d.purchases ?? []);
        }) },
    ],
    '/dashboard/invoices': [
        { queryKey: ['invoices', 'list'], queryFn: () => getInvoices().then(r => {
            const d = r.data;
            return Array.isArray(d) ? d : (d.items ?? d.data ?? d.invoices ?? []);
        }) },
    ],
};

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        const lastScan = localStorage.getItem('lastNotificationScan');
        const now = Date.now();
        if (!lastScan || now - parseInt(lastScan, 10) > 5 * 60 * 1000) {
            const token = localStorage.getItem('access_token');
            if (token) {
                triggerScan(token).then(() => {
                    localStorage.setItem('lastNotificationScan', now.toString());
                }).catch(console.error);
            }
        }
    }, [location.pathname]);

    const navItems = [
        { name: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Inventory',   icon: Package,         path: '/dashboard/inventory' },
        { name: 'Sales',       icon: ShoppingCart,    path: '/dashboard/sales' },
        { name: 'Purchases',   icon: ShoppingBag,     path: '/dashboard/purchases' },
        { name: 'Invoices',    icon: FileText,        path: '/dashboard/invoices' },
        { name: 'GST Reports', icon: Receipt,         path: '/dashboard/gst' },
        { name: 'Forecast',    icon: TrendingUp,      path: '/dashboard/forecast' },
        { name: 'AI Assistant',icon: Bot,             path: '/dashboard/ai-assistant', badge: 'AI' },
        { name: 'Alerts',      icon: Bell,            path: '/dashboard/alerts' },
        { name: 'Integrations',icon: Plug,            path: '/dashboard/integrations' },
        { name: 'Settings',    icon: Settings,        path: '/dashboard/settings' },
        { name: 'AI Report',   icon: Sparkles,        path: '/dashboard/ai-report', badge: 'New' },
        { name: 'Analytics',   icon: BarChart3,       path: '/dashboard/analytics' },
    ];

    // Prefetch data on nav hover
    const handleNavHover = useCallback((path: string) => {
        const configs = prefetchMap[path];
        if (!configs) return;
        configs.forEach(({ queryKey, queryFn }) => {
            queryClient.prefetchQuery({ queryKey, queryFn, staleTime: 60_000 });
        });
    }, [queryClient]);

    const userName = user?.name || 'User';
    const userInitials = userName.substring(0, 2).toUpperCase();

    return (
        <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900">
            {/* Global Loading Bar */}
            <GlobalLoadingBar />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo Area */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center text-white border border-gray-100 overflow-hidden shadow-sm">
                            <img src="/logos/main-logo.jpeg" alt="SmartGodown Logo" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <span className="text-xl font-bold text-[#0f172a] dark:text-white">
                            SmartGodown
                        </span>
                    </div>
                    <button
                        className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onMouseEnter={() => handleNavHover(item.path)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                    ? 'bg-green-50/50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                    <span className={`text-sm font-medium ${isActive ? 'text-green-600 dark:text-green-400' : ''}`}>
                                        {item.name}
                                    </span>
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-green-600 bg-green-100 rounded-full dark:bg-green-900/40 dark:text-green-400">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-semibold">
                                {userInitials}
                            </div>
                            <div className="max-w-[120px]">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">SmartGodown</span>
                            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                            <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsUploadOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            size="sm"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span className="hidden sm:inline">Upload CSV</span>
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium border border-green-100 dark:border-green-800/30">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Live Sync
                        </div>
                        <NotificationBell />
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <CsvUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
            
            {/* Global AI Chat Widget */}
            <ChatPanel />
        </div>
    );
}
