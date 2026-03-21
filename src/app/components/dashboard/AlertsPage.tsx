import React, { useEffect, useState } from 'react';
import { getAlerts } from '../../services/ai';
import { Badge } from '../ui/badge';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ChevronDown, ChevronUp, PackageX, AlertTriangle, Clock, TrendingDown } from 'lucide-react';

const GROUPS = [
    { key: 'out_of_stock', label: 'Out of Stock', color: 'text-red-700 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30', icon: PackageX },
    { key: 'critical_low', label: 'Critical Low', color: 'text-red-600 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30', icon: AlertTriangle },
    { key: 'low_stock', label: 'Low Stock', color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30', icon: Clock },
    { key: 'fast_mover_low', label: 'Urgent Reorder', color: 'text-orange-700 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30', icon: TrendingDown },
    { key: 'dead_stock', label: 'Dead Stock', color: 'text-gray-600 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700', icon: PackageX },
];

export function AlertsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [openStates, setOpenStates] = useState<Record<string, boolean>>({
        out_of_stock: true,
        critical_low: true
    });

    useEffect(() => {
        const fetchAlertsData = () => {
            setLoading(true);
            getAlerts()
                .then(r => setData(r.data))
                .catch(() => toast.error('Failed to load alerts'))
                .finally(() => setLoading(false));
        };

        fetchAlertsData();
        window.addEventListener('csv-uploaded', fetchAlertsData);
        return () => window.removeEventListener('csv-uploaded', fetchAlertsData);
    }, []);

    const toggleOpen = (key: string) => setOpenStates(prev => ({ ...prev, [key]: !prev[key] }));

    if (loading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                <span className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin mb-4"></span>
                Loading alerts...
            </div>
        );
    }

    if (!data) return null;

    const totalAlerts = GROUPS.reduce((acc, g) => acc + (data[g.key]?.length || 0), 0);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                        Stock Alerts
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4 sm:mb-0">
                        Grouped alerts generated intelligently from your inventory.
                    </p>
                </div>
                {totalAlerts > 0 && (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold px-4 py-1.5 rounded-full ring-1 ring-red-200/50 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        {totalAlerts} Total Alerts
                    </div>
                )}
            </div>

            {totalAlerts === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
                    <p className="text-gray-500 text-sm">No active alerts right now.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {GROUPS.map(({ key, label, color, icon: Icon }) => {
                        const items = data[key] || [];
                        if (items.length === 0) return null;
                        const isOpen = openStates[key];

                        return (
                            <motion.div 
                                key={key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`border rounded-xl overflow-hidden shadow-sm transition-colors ${color}`}
                            >
                                <button
                                    onClick={() => toggleOpen(key)}
                                    className="w-full flex items-center justify-between px-5 py-4 focus:outline-none group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 opacity-70 group-hover/btn:opacity-100 transition-opacity`} />
                                        <span className="font-semibold text-sm tracking-wide">{label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-white/50 dark:bg-black/20 text-current px-2.5 py-[2px] rounded-full text-xs font-bold ring-1 ring-current/10">
                                            {items.length} items
                                        </span>
                                        <div className="text-current opacity-60 group-hover/btn:opacity-100 transition-opacity">
                                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: 'auto', opacity: 1 }} 
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800"
                                        >
                                            {items.map((item: any) => (
                                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku} <span className="mx-1">•</span> {item.category}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 sm:gap-6 self-start sm:self-auto">
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                                                            Qty: <span className="text-black dark:text-white font-bold">{item.quantity}</span>
                                                        </span>
                                                        {item.last_sale_date && (
                                                            <span className="text-xs text-gray-400 hidden lg:block">
                                                                Last Sale: {new Date(item.last_sale_date).toLocaleDateString('en-IN')}
                                                            </span>
                                                        )}
                                                        <Badge variant="outline" className="opacity-80">
                                                            {key}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
