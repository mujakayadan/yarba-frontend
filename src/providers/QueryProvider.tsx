import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode, useEffect } from 'react';
import { subscribeToOnlineStatus } from '../platform/networkStatus';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

export const AppQueryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    onlineManager.setEventListener((setOnline) => {
      unsubscribe = subscribeToOnlineStatus(setOnline);
      return unsubscribe;
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export { queryClient };
