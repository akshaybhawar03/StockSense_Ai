import React from 'react';

const config: Record<string, { label: string, cls: string }> = {
   out_of_stock:    { label: 'Out of Stock', cls: 'bg-red-500/20 text-red-400' },
   low:             { label: 'Low Stock',    cls: 'bg-amber-500/20 text-amber-400' },
   healthy:         { label: 'In Stock',     cls: 'bg-green-500/20 text-green-400' },
   dead:            { label: 'Dead Stock',   cls: 'bg-gray-500/20 text-gray-400' },
};

export default function StatusBadge({ type }: { type: string }) {
   const { label, cls } = config[type] || config.healthy;
   return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}
