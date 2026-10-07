import type { ReactNode } from "react";

export interface QueryProviderProps {
  children: ReactNode;
}

export interface QueryClientConfigTokens {
  defaultStaleTime: number;
  defaultGcTime: number;
  liveWindowStaleTime: number;
  historicalWindowStaleTime: number;
  watchlistStaleTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  retryCount: number;
}
