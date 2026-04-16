import { useState, useCallback } from 'react';
import { Search, SortAsc, Users } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { PartyCard } from './PartyCard';
import { useParties } from './useLedger';
import type { PartyType, SortBy } from './ledger.types';

interface PartyListProps {
  partyType: PartyType;
}

function PartyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-28" />
        </div>
        <div className="text-right space-y-1 flex-shrink-0">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-16 ml-auto" />
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'outstanding', label: 'Highest Outstanding' },
  { value: 'overdue', label: 'Overdue First' },
];

export function PartyList({ partyType }: PartyListProps) {
  const [rawSearch, setRawSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('outstanding');
  const [expandedPartyId, setExpandedPartyId] = useState<string | null>(null);
  const [activePaymentBillId, setActivePaymentBillId] = useState<string | null>(null);

  const [search] = useDebounce(rawSearch, 300);
  const { data: parties = [], isLoading, isError } = useParties(partyType, search, sortBy);

  const handleToggleParty = useCallback(
    (partyId: string) => {
      setExpandedPartyId((prev) => {
        if (prev === partyId) return null;
        setActivePaymentBillId(null);
        return partyId;
      });
    },
    []
  );

  const handleTogglePayment = useCallback((billId: string | null) => {
    setActivePaymentBillId(billId);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${partyType === 'CUSTOMER' ? 'customers' : 'vendors'} by name or city…`}
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary,75_226_119))/40] transition-colors"
          />
        </div>

        <div className="relative flex-shrink-0">
          <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="appearance-none pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary,75_226_119))/40] transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Failed to load {partyType === 'CUSTOMER' ? 'customers' : 'vendors'}. Please try again.
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <PartyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !isError && parties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          {rawSearch ? (
            <>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No parties match your search</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different name or city.</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                No {partyType === 'CUSTOMER' ? 'customers' : 'vendors'} yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add your first {partyType === 'CUSTOMER' ? 'customer' : 'vendor'} to get started.
              </p>
            </>
          )}
        </div>
      )}

      {/* Party Cards */}
      {!isLoading && parties.length > 0 && (
        <div className="space-y-3">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              partyType={partyType}
              isExpanded={expandedPartyId === party.id}
              activePaymentBillId={expandedPartyId === party.id ? activePaymentBillId : null}
              onToggle={() => handleToggleParty(party.id)}
              onTogglePayment={handleTogglePayment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
