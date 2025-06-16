"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UnresolvedClient from './UnresolvedClient';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function UnresolvedPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnresolvedClient />
    </QueryClientProvider>
  );
} 