'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardClient from './DashboardClient';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function DashboardPage({ session }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardClient session={session} />
    </QueryClientProvider>
  );
} 