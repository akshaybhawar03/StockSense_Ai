import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '../../services/ai';
import toast from 'react-hot-toast';
import { AlertsSkeleton } from '../skeletons/AlertsSkeleton';

// These are the 5 groups the backend returns
const GROUPS = [
    { key: 'out_of_stock',   label: 'Out of Stock',                      header: 'bg-red-900/30 border-red-700/50 text-red-400' },
    { key: 'critical_low',   label: 'Critical Low (1–5 units)',          header: 'bg-red-900/20 border-red-700/30 text-red-400' },
    { key: 'low_stock',      label: 'Low Stock (6–10 units)',            header: 'bg-green-900/30 border-green-700/50 text-green-400' },
    { key: 'fast_mover_low', label: 'Urgent Reorder (fast moving + low qty)', header: 'bg-green-900/30 border-green-700/50 text-green-400' },
    { key: 'dead_stock',     label: 'Dead Stock (no sale 90+ days)',     header: 'bg-gray-800/50 border-gray-700/50 text-gray-400' },
];

export function AlertsPage() {
    const [open, setOpen] = useState<Record<string, boolean>>({ out_of_stock: true });

    const { data, isLoading, error } = useQuery({
        queryKey: ['alerts', 'active'],
        queryFn: ({ signal }) => getAlerts(signal).then(r => r.data),
        staleTime: 60_000,
    });

    if (error) return (
        <div className='p-6'>
            <div className='bg-red-900/20 border border-red-700/50 rounded-xl p-4'>
                <p className='text-red-400 text-sm'>Failed to load alerts. Check backend connection.</p>
            </div>
        </div>
    );

    const total = data ? GROUPS.reduce((s, g) => s + (data[g.key]?.length || 0), 0) : 0;

    return (
        <div className='p-6 max-w-4xl mx-auto'>
            <div className='flex items-center gap-3 mb-6'>
                <h1 className='text-2xl font-semibold text-white'>Stock Alerts</h1>
                {total > 0 && (
                    <span className='bg-red-500/20 text-red-400 text-sm font-medium px-3 py-0.5 rounded-full'>
                        {total} items need attention
                    </span>
                )}
            </div>

            {total === 0 && (
                <div className='text-center py-20'>
                    <p className='text-gray-400'>All stock levels are healthy. No alerts.</p>
                </div>
            )}

            <div className='space-y-3'>
                {GROUPS.map(({ key, label, header }) => {
                    const items = data[key] || [];
                    if (items.length === 0) return null;
                    const isOpen = !!open[key];
                    return (
                        <div key={key} className={`border rounded-xl overflow-hidden ${header}`}>
                            <button
                                onClick={() => setOpen(o => ({ ...o, [key]: !o[key] }))}
                                className='w-full flex items-center justify-between px-4 py-3'
                            >
                                <span className='font-medium text-sm'>{label}</span>
                                <span className='text-sm'>{items.length} items {isOpen ? '▲' : '▼'}</span>
                            </button>
                            {isOpen && (
                                <div className='bg-gray-900/50 divide-y divide-gray-700/50'>
                                    {items.map((item: any) => (
                                        <div key={item.id} className='flex items-center justify-between px-4 py-3'>
                                            <div>
                                                <p className='text-sm font-medium text-white'>{item.name}</p>
                                                <p className='text-xs text-gray-400 mt-0.5 font-mono'>
                                                    {item.sku} · {item.category}
                                                </p>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <span className='text-sm text-gray-300'>Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
