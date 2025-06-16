"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResolvedClient from './ResolvedClient';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function ResolvedPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ResolvedClient />
    </QueryClientProvider>
  );
} 