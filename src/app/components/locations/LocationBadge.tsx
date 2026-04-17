interface LocationBadgeProps {
  type: 'warehouse' | 'shop' | 'store';
  size?: 'sm' | 'md';
}

const TYPE_META = {
  warehouse: {
    label: 'Warehouse',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  shop: {
    label: 'Shop',
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  store: {
    label: 'Store',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
};

export function LocationBadge({ type, size = 'md' }: LocationBadgeProps) {
  const meta = TYPE_META[type] ?? TYPE_META.warehouse;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${meta.classes}`}>
      {meta.label}
    </span>
  );
}
