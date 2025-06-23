'use client'; // Mark this file as a client-side component

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import React Query client and provider
import { useState } from 'react'; // Import React useState hook

export default function Providers({ children }) { // Provider component that wraps the app with React Query
  const [queryClient] = useState(() => new QueryClient()); // Create a persistent QueryClient instance

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 