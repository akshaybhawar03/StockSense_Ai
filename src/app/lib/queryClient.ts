import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,      // 1 minute
      gcTime: 300_000,        // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
