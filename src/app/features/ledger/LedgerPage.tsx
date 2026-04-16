import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Store } from 'lucide-react';
import { SummaryStrip } from './SummaryStrip';
import { PartyList } from './PartyList';
import type { PartyType } from './ledger.types';

const TABS: { type: PartyType; label: string; icon: typeof Users }[] = [
  { type: 'CUSTOMER', label: 'Customers (Receivables)', icon: Users },
  { type: 'VENDOR', label: 'Vendors (Payables)', icon: Store },
];

export function LedgerPage() {
  const [activeTab, setActiveTab] = useState<PartyType>('CUSTOMER');

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Party Ledger
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage receivables from customers and payables to vendors
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-primary,75_226_119))] ${
                isActive
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Summary Strip */}
      <SummaryStrip type={activeTab} />

      {/* Party List — full re-mount on tab switch to reset all state */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <PartyList partyType={activeTab} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
