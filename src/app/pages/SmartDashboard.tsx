import React from 'react';
import { DashboardPreview } from '../components/inventory/DashboardPreview';
import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';

export function SmartDashboard() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg ring-1 ring-white/20">
                    <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Analytics Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400">Deep insights into your inventory performance and AI predictions</p>
                </div>
            </motion.div>

            <DashboardPreview />
        </div>
    );
}
