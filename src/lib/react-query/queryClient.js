import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Match your current CacheDataContext expiration time
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      // Mutation specific options
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
