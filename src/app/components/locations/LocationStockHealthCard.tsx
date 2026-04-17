import { useNavigate } from 'react-router';
import { LocationBadge } from './LocationBadge';

export interface LocationSummary {
  id: string;
  name: string;
  type: 'warehouse' | 'shop' | 'store';
  healthy_stock_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface Props {
  location: LocationSummary;
}

export function LocationStockHealthCard({ location }: Props) {
  const navigate = useNavigate();
  const { id, name, type, healthy_stock_count, low_stock_count, out_of_stock_count } = location;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 min-w-[220px] shadow-sm hover:shadow-md transition-shadow">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
          <LocationBadge type={type} size="sm" />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {healthy_stock_count}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
            {low_stock_count}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {out_of_stock_count}
          </span>
        </div>
      </div>
      <button
        onClick={() => navigate(`/dashboard/locations/${id}`)}
        className="shrink-0 h-7 px-3 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[rgb(var(--accent-primary))]/10 hover:text-[rgb(var(--accent-primary))] border border-gray-200 dark:border-gray-700 transition-colors"
      >
        View
      </button>
    </div>
  );
}
