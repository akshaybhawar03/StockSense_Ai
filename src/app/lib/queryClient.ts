import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,      // 1 minute
      gcTime: 60_000,         // 1 minute — prevents paginated filter keys from bloating memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
