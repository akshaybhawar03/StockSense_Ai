import { useState } from 'react';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTransfers, cancelTransfer } from '../services/transfers';
import type { TransferResponse } from '../services/transfers';
import { useLocation } from '../contexts/LocationContext';
import { TransferModal } from '../components/transfers/TransferModal';
import { TransferDetailDrawer } from '../components/transfers/TransferDetailDrawer';

const STATUS_META = {
  pending:   { label: 'Pending',   classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

function formatDate(d: string) {
  try { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

function truncate(s: string | undefined, n: number) {
  if (!s) return '—';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

const PAGE_SIZE = 50;

export function TransfersPage() {
  const queryClient = useQueryClient();
  const { locationsList } = useLocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerTransfer, setDrawerTransfer] = useState<TransferResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const filters = { status: statusFilter || undefined, location_id: locationFilter || undefined, from_date: fromDate || undefined, to_date: toDate || undefined, page, page_size: PAGE_SIZE };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transfers', 'list', filters],
    queryFn: () => getTransfers(filters).then(res => {
      const d = res.data;
      const items: TransferResponse[] = Array.isArray(d) ? d : (d.items ?? d.transfers ?? d.data ?? []);
      const total = d.total ?? d.count ?? items.length;
      return { items, total };
    }),
    staleTime: 5 * 60 * 1000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelTransfer(id),
    onSuccess: () => {
      toast.success('Transfer cancelled');
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Something went wrong, please try again';
      if (err?.response?.status === 403) toast.error('Access denied');
      else toast.error(msg);
    },
  });

  const transfers: TransferResponse[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleNewTransferSuccess = () => {
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['transfers'] });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Stock Transfers</h1>
        <button
          onClick={() => { setModalOpen(true); /* analytics: transfer_initiated */ }}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[rgb(var(--accent-primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Transfer
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={fromDate}
          onChange={e => { setFromDate(e.target.value); setPage(1); }}
          title="From date"
          className="h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
        />
        <span className="text-xs text-gray-400">–</span>
        <input
          type="date"
          value={toDate}
          onChange={e => { setToDate(e.target.value); setPage(1); }}
          title="To date"
          className="h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
        />
        <select
          value={locationFilter}
          onChange={e => { setLocationFilter(e.target.value); setPage(1); }}
          className="h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
        >
          <option value="">All Locations</option>
          {locationsList.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-primary))]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/40 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden md:table-cell px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <ArrowLeftRight className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">No transfers yet</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">Use stock transfers to move inventory between your locations and keep records.</p>
                      <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 h-8 px-4 rounded-lg bg-[rgb(var(--accent-primary))] text-white text-xs font-medium hover:opacity-90 transition-opacity">
                        <Plus className="w-3.5 h-3.5" /> Create first transfer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                transfers.map(t => {
                  const sm = STATUS_META[t.status] ?? STATUS_META.pending;
                  const displayId = 'TRF-' + t.id.slice(-4).toUpperCase();
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">{displayId}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(t.transfer_date)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t.product_name}</p>
                        {t.product_sku && <p className="text-[11px] text-gray-400 font-mono">{t.product_sku}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{t.quantity.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{t.from_location_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{t.to_location_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${sm.classes}`}>{sm.label}</span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[120px] truncate" title={t.note}>
                        {truncate(t.note, 40)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setDrawerTransfer(t); setDrawerOpen(true); }}
                            className="h-7 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            View
                          </button>
                          {t.status === 'pending' && (
                            <button
                              onClick={() => cancelMutation.mutate(t.id)}
                              disabled={cancelMutation.isPending}
                              className="h-7 px-2 text-xs rounded-lg border border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
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

      <TransferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleNewTransferSuccess}
      />

      <TransferDetailDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setDrawerTransfer(null); }}
        transfer={drawerTransfer}
        onCancelled={() => { queryClient.invalidateQueries({ queryKey: ['transfers'] }); refetch(); }}
      />
    </div>
  );
}
