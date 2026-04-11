import React from 'react';
import { ProductTable } from '../components/inventory/ProductTable';
import { LowStockAlert } from '../components/inventory/LowStockAlert';
import { Package } from 'lucide-react';
import { motion } from 'motion/react';

export function SmartInventory() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <LowStockAlert />
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg ring-1 ring-white/20">
                    <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Smart Inventory</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage real-time inventory and AI-driven stock adjustments</p>
                </div>
            </motion.div>

            <ProductTable />
        </div>
    );
}
