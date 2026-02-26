import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Bell, AlertOctagon, TrendingDown, PackageX, CalendarClock, ShieldAlert, Check } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function AlertsPage() {
    const { inventory } = useData();

    const alerts = useMemo(() => {
        const generatedAlerts: any[] = [];
        let idCounter = 1;

        inventory.forEach(item => {
            // Out of stock alert
            if (item.stock === 0) {
                generatedAlerts.push({
                    id: idCounter++,
                    type: 'critical',
                    title: 'Out of Stock Alert',
                    message: `${item.name || item.sku} has completely run out of stock. Immediate action required.`,
                    icon: AlertOctagon,
                    time: 'Just now'
                });
            }
            // Low stock alert
            else if (item.stock <= 10) {
                generatedAlerts.push({
                    id: idCounter++,
                    type: 'warning',
                    title: 'Low Stock Warning',
                    message: `Only ${item.stock} units left of ${item.name || item.sku}. Consider restocking soon.`,
                    icon: CalendarClock,
                    time: 'Today'
                });
            }

            // Dead stock alert
            if (item.stock > 50 && item.sales === 0) {
                generatedAlerts.push({
                    id: idCounter++,
                    type: 'info',
                    title: 'Capital Locked in Dead Stock',
                    message: `You have ${item.stock} units of ${item.name || item.sku} with zero recent sales.`,
                    icon: PackageX,
                    time: 'Yesterday'
                });
            }
        });

        // Add a few global mock alerts if inventory exists
        if (inventory.length > 5) {
            generatedAlerts.push({
                id: idCounter++,
                type: 'trend',
                title: 'Revenue Drop Predicted',
                message: 'AI forecasts a 12% revenue drop next week due to approaching stock-outs in top categories.',
                icon: TrendingDown,
                time: '2 days ago'
            });
            generatedAlerts.push({
                id: idCounter++,
                type: 'critical',
                title: 'Supplier Delay Notice',
                message: 'Global logistics indicate a 5-day delay for shipments coming from Asia. Adjust lead times.',
                icon: ShieldAlert,
                time: '2 days ago'
            });
        }

        // Sort: critical first, then warning, then info/trend
        const weight: Record<string, number> = { 'critical': 4, 'warning': 3, 'trend': 2, 'info': 1 };
        generatedAlerts.sort((a, b) => weight[b.type] - weight[a.type]);

        return generatedAlerts;
    }, [inventory]);

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'critical': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300';
            case 'warning': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-300';
            case 'trend': return 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30 text-purple-800 dark:text-purple-300';
            case 'info': default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-300';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'critical': return 'text-red-600 dark:text-red-400';
            case 'warning': return 'text-orange-600 dark:text-orange-400';
            case 'trend': return 'text-purple-600 dark:text-purple-400';
            case 'info': default: return 'text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                        Smart Alerts & Notifications
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Stay ahead of disruptions with AI-curated actionable alerts.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Check className="w-4 h-4" /> Mark all as read
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                <AnimatePresence>
                    {alerts.length > 0 ? alerts.map((alert, idx) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className={`p-5 md:p-6 border relative overflow-hidden transition-all hover:shadow-md ${getAlertStyles(alert.type)}`}>
                                <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" />

                                <div className="flex gap-4">
                                    <div className={`mt-1 sm:mt-0 p-2 sm:p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm shrink-0 h-fit ${getIconColor(alert.type)}`}>
                                        <alert.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                            <h3 className="text-base sm:text-lg font-bold truncate">
                                                {alert.title}
                                            </h3>
                                            <span className="text-xs font-semibold opacity-70 whitespace-nowrap">
                                                {alert.time}
                                            </span>
                                        </div>
                                        <p className="text-sm opacity-90 leading-relaxed max-w-2xl">
                                            {alert.message}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {alert.type === 'critical' && (
                                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-0">
                                                    Restock Now
                                                </Button>
                                            )}
                                            {alert.type === 'trend' && (
                                                <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-sm">
                                                    View Forecast
                                                </Button>
                                            )}
                                            {alert.type === 'info' && (
                                                <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-sm">
                                                    View Dead Stock
                                                </Button>
                                            )}
                                            <Button size="sm" variant="ghost" className="opacity-70 hover:opacity-100">
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )) : (
                        <Card className="p-12 text-center bg-gray-50/50 dark:bg-gray-800/30 border-dashed border-2">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Clear!</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                You have no active alerts. Your inventory is perfectly balanced and your supply chain is running smoothly.
                            </p>
                        </Card>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
