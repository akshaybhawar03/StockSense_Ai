import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes — data stays fresh, no refetch on re-mount
      gcTime: 10 * 60 * 1000,     // 10 minutes — keep cache alive across page navigations
      retry: 1,
      refetchOnWindowFocus: false, // never refetch just because user switches tabs
      refetchOnReconnect: false,   // never refetch on network reconnect
      refetchInterval: false,      // no automatic background polling
    },
  },
});
