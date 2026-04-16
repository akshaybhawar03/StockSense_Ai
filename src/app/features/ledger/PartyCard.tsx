import { ChevronDown, ChevronUp, MapPin, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR, getInitials, getAvatarColor } from './ledger.utils';
import { BillsTable } from './BillsTable';
import type { Party, PartyType } from './ledger.types';

interface PartyCardProps {
  party: Party;
  partyType: PartyType;
  isExpanded: boolean;
  activePaymentBillId: string | null;
  onToggle: () => void;
  onTogglePayment: (billId: string | null) => void;
}

export function PartyCard({
  party,
  partyType,
  isExpanded,
  activePaymentBillId,
  onToggle,
  onTogglePayment,
}: PartyCardProps) {
  const initials = getInitials(party.name);
  const avatarColor = getAvatarColor(party.id);
  const hasOutstanding = (party.outstanding_amount ?? 0) > 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm ${
        isExpanded
          ? 'border-[rgb(var(--accent-primary,75_226_119))/50] shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow'
      }`}
    >
      {/* Party header row */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-primary,75_226_119))] rounded-2xl"
        aria-expanded={isExpanded}
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${avatarColor}`}
        >
          {initials}
        </div>

        {/* Name + city + bill count */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white truncate">{party.name}</span>
            {party.has_overdue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 flex-shrink-0">
                OVERDUE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {party.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {party.city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Receipt className="w-3 h-3" />
              {party.bill_count} {party.bill_count === 1 ? 'bill' : 'bills'}
            </span>
          </div>
        </div>

        {/* Outstanding amount */}
        <div className="text-right flex-shrink-0">
          <p
            className={`text-base font-bold tabular-nums ${
              hasOutstanding ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {hasOutstanding ? formatINR(party.outstanding_amount ?? 0) : 'Settled'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">outstanding</p>
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0 ml-2 text-gray-400 dark:text-gray-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable detail */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 dark:border-gray-700">
              <BillsTable
                partyId={party.id}
                partyType={partyType}
                activePaymentBillId={activePaymentBillId}
                onTogglePayment={onTogglePayment}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
