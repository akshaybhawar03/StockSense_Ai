import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import type { BillStatus } from './ledger.types';

export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function isOverdue(dueDateStr: string, status: BillStatus): boolean {
  if (status === 'PAID') return false;
  try {
    const due = startOfDay(parseISO(dueDateStr));
    const today = startOfDay(new Date());
    return isBefore(due, today);
  } catch {
    return false;
  }
}

export function getStatusBadge(status: BillStatus): { label: string; className: string } {
  switch (status) {
    case 'PAID':
      return { label: 'PAID', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' };
    case 'UNPAID':
      return { label: 'UNPAID', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
    case 'PARTIAL':
      return { label: 'PARTIAL', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' };
    case 'OVERDUE':
      return { label: 'OVERDUE', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
