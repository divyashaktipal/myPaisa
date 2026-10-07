"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { QueryProviderProps } from "@/types";
import { QUERY_CLIENT_CONFIG } from "@/constants";

const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_CLIENT_CONFIG?.defaultStaleTime ?? 300000,
            gcTime: QUERY_CLIENT_CONFIG?.defaultGcTime ?? 3600000,
            refetchOnWindowFocus: QUERY_CLIENT_CONFIG?.refetchOnWindowFocus ?? false,
            refetchOnReconnect: QUERY_CLIENT_CONFIG?.refetchOnReconnect ?? false,
            retry: QUERY_CLIENT_CONFIG?.retryCount ?? 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryProvider;
