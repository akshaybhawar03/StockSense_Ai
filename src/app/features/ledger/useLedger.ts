import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type {
  PartyType,
  SortBy,
  PartySummary,
  Party,
  Bill,
  LedgerEntry,
  RecordPaymentPayload,
} from './ledger.types';

// ── Query keys ────────────────────────────────────────────────────────────────

export const ledgerKeys = {
  summary: (type: PartyType) => ['ledger', 'summary', type] as const,
  parties: (type: PartyType, search: string, sortBy: SortBy) =>
    ['ledger', 'parties', type, search, sortBy] as const,
  bills: (partyId: string) => ['ledger', 'bills', partyId] as const,
  ledger: (partyId: string) => ['ledger', 'entries', partyId] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function usePartySummary(type: PartyType) {
  return useQuery<PartySummary>({
    queryKey: ledgerKeys.summary(type),
    queryFn: async () => {
      const { data } = await api.get('/ledger/summary', { params: { type } });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useParties(type: PartyType, search: string, sortBy: SortBy) {
  return useQuery<Party[]>({
    queryKey: ledgerKeys.parties(type, search, sortBy),
    queryFn: async () => {
      const { data } = await api.get('/ledger/parties', {
        params: { type, search: search || undefined, sort_by: sortBy },
      });
      return Array.isArray(data) ? data : data.items ?? data.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePartyBills(partyId: string | null) {
  return useQuery<Bill[]>({
    queryKey: ledgerKeys.bills(partyId ?? ''),
    queryFn: async () => {
      const { data } = await api.get(`/ledger/parties/${partyId}/bills`);
      return Array.isArray(data) ? data : data.items ?? data.data ?? [];
    },
    enabled: !!partyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePartyLedger(partyId: string | null) {
  return useQuery<LedgerEntry[]>({
    queryKey: ledgerKeys.ledger(partyId ?? ''),
    queryFn: async () => {
      const { data } = await api.get(`/ledger/parties/${partyId}/ledger`);
      return Array.isArray(data) ? data : data.items ?? data.data ?? [];
    },
    enabled: !!partyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecordPayment(partyType: PartyType, partyId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { billId: string; payload: RecordPaymentPayload }>({
    mutationFn: async ({ billId, payload }) => {
      await api.post(`/ledger/bills/${billId}/payments`, payload);
    },
    onSuccess: () => {
      if (partyId) {
        queryClient.invalidateQueries({ queryKey: ledgerKeys.bills(partyId) });
        queryClient.invalidateQueries({ queryKey: ledgerKeys.ledger(partyId) });
      }
      queryClient.invalidateQueries({ queryKey: ledgerKeys.summary(partyType) });
      if (partyId) {
        queryClient.invalidateQueries({ queryKey: ['ledger', 'parties'] });
      }
    },
  });
}
