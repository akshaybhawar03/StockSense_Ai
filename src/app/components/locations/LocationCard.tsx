import { MapPin, Eye, Pencil, PowerOff } from 'lucide-react';
import { LocationBadge } from './LocationBadge';
import type { Location } from '../../contexts/LocationContext';

const formatINR = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

interface LocationCardProps {
  location: Location;
  onEdit: (loc: Location) => void;
  onDeactivate: (loc: Location) => void;
  onViewInventory: (loc: Location) => void;
}

export function LocationCard({ location, onEdit, onDeactivate, onViewInventory }: LocationCardProps) {
  const { name, type, city, address_line1, total_products, total_stock_value, is_active } = location;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-4 transition-shadow hover:shadow-md ${
        !is_active ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{name}</h3>
            {!is_active && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                Inactive
              </span>
            )}
          </div>
          <LocationBadge type={type} size="sm" />
        </div>
        <div className="shrink-0 w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {address_line1}, {city}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Products</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{total_products.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Stock Value</p>
          <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 truncate">{formatINR(total_stock_value)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onViewInventory(location)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/20 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
        <button
          onClick={() => onEdit(location)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        {is_active && (
          <button
            onClick={() => onDeactivate(location)}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Deactivate"
          >
            <PowerOff className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
