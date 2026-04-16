import { formatINR, formatDate } from './ledger.utils';
import type { LedgerEntry } from './ledger.types';

interface LedgerPanelProps {
  entries: LedgerEntry[];
  isLoading: boolean;
  isError: boolean;
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function LedgerPanel({ entries, isLoading, isError }: LedgerPanelProps) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
        Ledger Statement
      </h4>

      {isError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-3">
          Failed to load ledger entries.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/60 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Debit</th>
                <th className="px-4 py-3 text-right font-semibold">Credit</th>
                <th className="px-4 py-3 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                    No ledger entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{entry.description}</td>
                    <td className="px-4 py-3 text-right">
                      {entry.debit != null ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {formatINR(entry.debit)}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {entry.credit != null ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatINR(entry.credit)}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200">
                      {formatINR(entry.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
