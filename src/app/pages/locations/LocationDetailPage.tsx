import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronRight, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLocation, getLocationStats, getLocationInventory } from '../../services/locations';
import { LocationBadge } from '../../components/locations/LocationBadge';
import { Card } from '../../components/ui/card';

const formatINR = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val ?? 0);

export function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const { data: locationData } = useQuery({
    queryKey: ['location', id],
    queryFn: () => getLocation(id!).then(r => r.data),
    enabled: !!id,
    staleTime: 60_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['location', id, 'stats'],
    queryFn: () => getLocationStats(id!).then(r => r.data),
    enabled: !!id,
    staleTime: 60_000,
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['location', id, 'inventory', { search, page }],
    queryFn: () => getLocationInventory(id!, { search: search || undefined, page, page_size: PAGE_SIZE }).then(res => {
      const d = res.data;
      const items = d.items ?? d.data ?? d.products ?? (Array.isArray(d) ? d : []);
      const total = d.total ?? d.count ?? items.length;
      return { items, total };
    }),
    enabled: !!id,
    staleTime: 60_000,
  });

  const location = locationData;
  const stats = statsData;
  const items = inventoryData?.items ?? [];
  const total = inventoryData?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statCards = [
    { label: 'Total Products',    value: stats?.total_products?.toLocaleString('en-IN') ?? '—' },
    { label: 'Total Stock Units', value: stats?.total_stock_units?.toLocaleString('en-IN') ?? '—' },
    { label: 'Stock Value',       value: stats?.total_stock_value != null ? formatINR(stats.total_stock_value) : '—' },
    { label: 'Low Stock',         value: stats?.low_stock_count?.toLocaleString('en-IN') ?? '—', warn: (stats?.low_stock_count ?? 0) > 0 },
    { label: 'Out of Stock',      value: stats?.out_of_stock_count?.toLocaleString('en-IN') ?? '—', danger: (stats?.out_of_stock_count ?? 0) > 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <button onClick={() => navigate('/dashboard/locations')} className="hover:text-[rgb(var(--accent-primary))] transition-colors">
          Locations
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{location?.name ?? '—'}</span>
      </div>

      {/* Location header */}
      {location && (
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{location.name}</h1>
          <LocationBadge type={location.type} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{location.city}, {location.state}</span>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(card => (
          <Card
            key={card.label}
            className={`p-4 border-0 shadow-sm bg-white dark:bg-gray-800 ${card.danger ? 'border-l-2 border-l-red-500' : card.warn ? 'border-l-2 border-l-amber-400' : ''}`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.danger ? 'text-red-600 dark:text-red-400' : card.warn ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
              {card.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Inventory table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Products at this Location
          </h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…"
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/40 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {inventoryLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No products found at this location.{' '}
                    <button onClick={() => navigate('/dashboard/inventory')} className="text-[rgb(var(--accent-primary))] hover:underline">
                      View all products →
                    </button>
                  </td>
                </tr>
              ) : (
                items.map((item: any) => {
                  const qty = item.quantity ?? item.current_stock ?? item.stock ?? 0;
                  const isOut = qty === 0;
                  const isLow = qty > 0 && qty <= 10;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">{item.sku}</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{item.category ?? '—'}</td>
                      <td className={`px-5 py-3 text-right font-semibold ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                        {qty.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString('en-IN')}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-7 px-2 text-xs rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">‹ Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-7 px-2 text-xs rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
