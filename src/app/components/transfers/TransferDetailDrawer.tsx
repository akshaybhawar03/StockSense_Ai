import { useState } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { cancelTransfer } from '../../services/transfers';
import type { TransferResponse } from '../../services/transfers';

const STATUS_META = {
  pending:   { label: 'Pending',   classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transfer: TransferResponse | null;
  onCancelled: () => void;
}

export function TransferDetailDrawer({ isOpen, onClose, transfer, onCancelled }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const [localTransfer, setLocalTransfer] = useState<TransferResponse | null>(null);

  const t = localTransfer ?? transfer;

  const handleCancel = async () => {
    if (!t) return;
    setCancelling(true);
    try {
      const res = await cancelTransfer(t.id);
      const updated = { ...t, status: 'cancelled' as const, ...res.data };
      setLocalTransfer(updated);
      toast.success('Transfer cancelled');
      // analytics: transfer_cancelled
      onCancelled();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Something went wrong, please try again';
      if (err?.response?.status === 403) toast.error('Access denied');
      else toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  const statusMeta = t ? (STATUS_META[t.status] ?? STATUS_META.pending) : STATUS_META.pending;
  const displayId = t ? 'TRF-' + t.id.slice(-4).toUpperCase() : '—';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white font-mono">{displayId}</h2>
            {t && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(t.created_at)}</p>}
          </div>
          <div className="flex items-center gap-2">
            {t && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusMeta.classes}`}>
                {statusMeta.label}
              </span>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!t ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No transfer selected.</p>
          ) : (
            <>
              {/* Product */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Product</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.product_name}</p>
                {t.product_sku && <p className="text-xs text-gray-400 font-mono mt-0.5">{t.product_sku}</p>}
                {t.product_category && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.product_category}</p>}
              </div>

              {/* Quantity */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Quantity Moved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{t.quantity.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400 mt-0.5">units</p>
              </div>

              {/* From → To */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Route</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">From</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.from_location_name}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs text-gray-400 mb-0.5">To</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.to_location_name}</p>
                  </div>
                </div>
              </div>

              {/* Transfer Date */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Transfer Date</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(t.transfer_date)}</p>
              </div>

              {/* Note */}
              {t.note && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Note</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{t.note}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {t?.status === 'pending' && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full h-10 rounded-lg border border-red-200 dark:border-red-800/50 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelling ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</> : 'Cancel Transfer'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
