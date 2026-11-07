import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Singleton para o cliente para garantir consistência
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 3,
        },
      },
    });
  }
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 3,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
