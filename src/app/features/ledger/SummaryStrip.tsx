import { TrendingDown, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatINR } from './ledger.utils';
import type { PartyType } from './ledger.types';
import { usePartySummary } from './useLedger';

interface SummaryStripProps {
  type: PartyType;
}

function MetricSkeleton() {
  return (
    <div className="flex-1 min-w-[200px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-7 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export function SummaryStrip({ type }: SummaryStripProps) {
  const { data, isLoading, isError } = usePartySummary(type);

  if (isLoading) {
    return (
      <div className="flex gap-4 flex-wrap">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        Failed to load summary. Please refresh.
      </div>
    );
  }

  const isReceivables = type === 'CUSTOMER';

  const cards = [
    {
      label: isReceivables ? 'Total Receivables' : 'Total Payables',
      value: data.total_outstanding,
      icon: TrendingDown,
      valueClass: data.total_outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-500',
    },
    {
      label: 'Overdue 30+ Days',
      value: data.overdue_30_plus,
      icon: AlertTriangle,
      valueClass: data.overdue_30_plus > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500',
    },
    {
      label: isReceivables ? 'Collected This Month' : 'Paid This Month',
      value: data.collected_this_month,
      icon: TrendingUp,
      valueClass: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex-1 min-w-[200px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </span>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${card.valueClass}`}>
              {formatINR(card.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
