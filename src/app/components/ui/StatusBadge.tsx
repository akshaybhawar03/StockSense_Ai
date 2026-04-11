import React from 'react';

export default function StatusBadge({ type, item }: { type?: string, item?: any }) {
  const getStatus = (itm: any, typ?: string) =>
    itm?.alert_type || itm?.status || typ || 'healthy';

  const statusConfig: Record<string, { label: string, cls: string }> = {
    out_of_stock:  { label: 'Out of Stock',  cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    low:           { label: 'Low Stock',     cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    healthy:       { label: 'In Stock',      cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    dead:          { label: 'Dead Stock',    cls: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  };

  const st = statusConfig[getStatus(item, type)] || statusConfig.healthy;
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
      {st.label}
    </span>
  );
}
