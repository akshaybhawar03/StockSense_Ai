import { useState, useEffect, useRef, useCallback } from 'react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ChevronDown, Loader2 } from 'lucide-react';
import { formatINR, formatDate, isOverdue, getStatusBadge, todayISO } from './ledger.utils';
import { usePartyBills, usePartyLedger, useRecordPayment } from './useLedger';
import { LedgerPanel } from './LedgerPanel';
import type { Bill, PaymentMode, PartyType } from './ledger.types';

// ── Payment form schema ───────────────────────────────────────────────────────

const paymentSchema = z.object({
  amount: z.number().positive(),
  payment_date: z.string().min(1),
  mode: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Cheque']),
  reference_number: z.string().optional(),
});

// ── Inline Payment Form ───────────────────────────────────────────────────────

interface PaymentFormProps {
  bill: Bill;
  partyType: PartyType;
  partyId: string;
  onClose: () => void;
}

function PaymentForm({ bill, partyType, partyId, onClose }: PaymentFormProps) {
  const [amount, setAmount] = useState(String(bill.remaining_amount));
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [reference, setReference] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const mutation = useRecordPayment(partyType, partyId);

  const amountNum = parseFloat(amount);
  const amountValid = !isNaN(amountNum) && amountNum > 0 && amountNum <= bill.remaining_amount;
  const showReference = mode === 'Cheque' || mode === 'Bank Transfer';

  useEffect(() => {
    amountInputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!amountValid) return;
    setErrorBanner(null);

    const payload = {
      amount: amountNum,
      payment_date: paymentDate,
      mode,
      reference_number: showReference && reference ? reference : undefined,
    };

    const parsed = paymentSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorBanner('Please fill all required fields correctly.');
      return;
    }

    try {
      await mutation.mutateAsync({ billId: bill.id, payload });
      toast.success('Payment recorded successfully');
      onClose();
    } catch {
      setErrorBanner('Failed to record payment. Please try again.');
    }
  }, [amountValid, amountNum, paymentDate, mode, reference, showReference, bill.id, mutation, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && amountValid && !mutation.isPending) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [amountValid, mutation.isPending, handleSubmit, onClose]
  );

  return (
    <tr onKeyDown={handleKeyDown}>
      <td colSpan={7} className="px-0 py-0">
        <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-b border-gray-200 dark:border-gray-600 px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Record Payment for {bill.bill_number}
          </p>

          {errorBanner && (
            <div className="mb-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
              {errorBanner}
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-start">
            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Amount (max {formatINR(bill.remaining_amount)})</label>
              <input
                ref={amountInputRef}
                type="number"
                min="0.01"
                max={bill.remaining_amount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-44 px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                  amount && !amountValid
                    ? 'border-red-400 focus:ring-red-300 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[var(--accent-primary,#4bde77)]/40'
                }`}
              />
              {amount && !amountValid && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {amountNum <= 0 ? 'Amount must be > 0' : `Max allowed is ${formatINR(bill.remaining_amount)}`}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-40 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary,#4bde77)]/40 transition-colors"
              />
            </div>

            {/* Mode */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Payment Mode</label>
              <div className="relative">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as PaymentMode)}
                  className="appearance-none w-40 px-3 py-2 pr-8 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary,#4bde77)]/40 transition-colors cursor-pointer"
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Reference */}
            {showReference && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Reference No. <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={mode === 'Cheque' ? 'Cheque number' : 'UTR / transaction ID'}
                  className="w-48 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary,#4bde77)]/40 transition-colors"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 items-end pb-px mt-auto">
              <button
                onClick={handleSubmit}
                disabled={!amountValid || mutation.isPending}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
              >
                {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </button>
              <button
                onClick={onClose}
                disabled={mutation.isPending}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Bill Row ──────────────────────────────────────────────────────────────────

interface BillRowProps {
  bill: Bill;
  partyType: PartyType;
  partyId: string;
  isPaymentOpen: boolean;
  onTogglePayment: (billId: string | null) => void;
}

function BillRow({ bill, partyType, partyId, isPaymentOpen, onTogglePayment }: BillRowProps) {
  const effectiveOverdue = isOverdue(bill.due_date, bill.status);
  const effectiveStatus: typeof bill.status =
    effectiveOverdue && bill.status !== 'PAID' ? 'OVERDUE' : bill.status;
  const badge = getStatusBadge(effectiveStatus);

  return (
    <>
      <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
          {bill.bill_number}
        </td>
        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {formatDate(bill.bill_date)}
        </td>
        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
          {formatINR(bill.amount)}
        </td>
        <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          {formatINR(bill.paid_amount)}
        </td>
        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">
          {bill.remaining_amount > 0 ? formatINR(bill.remaining_amount) : '—'}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          {bill.remaining_amount > 0 && (
            <button
              onClick={() => onTogglePayment(isPaymentOpen ? null : bill.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isPaymentOpen
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {isPaymentOpen ? 'Cancel' : 'Record Payment'}
            </button>
          )}
        </td>
      </tr>
      {isPaymentOpen && (
        <PaymentForm
          bill={bill}
          partyType={partyType}
          partyId={partyId}
          onClose={() => onTogglePayment(null)}
        />
      )}
    </>
  );
}

// ── BillsTable ────────────────────────────────────────────────────────────────

interface BillsTableProps {
  partyId: string;
  partyType: PartyType;
  activePaymentBillId: string | null;
  onTogglePayment: (billId: string | null) => void;
}

function BillRowSkeleton() {
  return (
    <tr className="animate-pulse bg-white dark:bg-gray-800">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
        </td>
      ))}
    </tr>
  );
}

export function BillsTable({ partyId, partyType, activePaymentBillId, onTogglePayment }: BillsTableProps) {
  const { data: bills = [], isLoading: billsLoading, isError: billsError } = usePartyBills(partyId);
  const { data: ledgerEntries = [], isLoading: ledgerLoading, isError: ledgerError } = usePartyLedger(partyId);

  return (
    <div className="px-6 pb-6">
      {/* Bills Table */}
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
        Bills
      </h4>

      {billsError && (
        <div className="mb-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Failed to load bills for this party.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/60 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 text-left font-semibold">Bill #</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                <th className="px-4 py-3 text-right font-semibold">Remaining</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {billsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <BillRowSkeleton key={i} />)
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
                    No bills raised yet for this party.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <BillRow
                    key={bill.id}
                    bill={bill}
                    partyType={partyType}
                    partyId={partyId}
                    isPaymentOpen={activePaymentBillId === bill.id}
                    onTogglePayment={onTogglePayment}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LedgerPanel entries={ledgerEntries} isLoading={ledgerLoading} isError={ledgerError} />
    </div>
  );
}
