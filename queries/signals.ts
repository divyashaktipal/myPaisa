import type { SignalsApiResponse } from "@/types/Signals";

/**
 * Generates the query key for market trading signals.
 */
export function getSignalsQueryKey(scope: string = "all") {
  return ["market-signals", scope] as const;
}

/**
 * Fetches market trading signals data from the API.
 */
export async function fetchSignals(): Promise<SignalsApiResponse> {
  const res = await fetch("/api/market/signals");
  if (!res.ok) {
    throw new Error("Failed to load signals data.");
  }
  return res.json();
}

/**
 * Standard TanStack Query options for the signals query.
 */
export function signalsQueryOptions(scope: string = "all", initialData?: SignalsApiResponse) {
  return {
    queryKey: getSignalsQueryKey(scope),
    queryFn: fetchSignals,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    ...(initialData ? { initialData } : {}),
  };
}
