import type { MarketNewsResponse, NewsFilterTab } from "@/types/MarketNews";

/**
 * Generates the query key for market news.
 */
export function getNewsQueryKey(category: NewsFilterTab = "top_stories", query: string = "") {
  return ["market-news", category, query] as const;
}

/**
 * Fetches market news from the API with optional category filter and query term.
 */
export async function fetchMarketNews(
  category: NewsFilterTab = "top_stories",
  query: string = ""
): Promise<MarketNewsResponse> {
  const url = new URL(
    "/api/news",
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );
  url.searchParams.set("category", category);
  if (query.trim()) {
    url.searchParams.set("query", query.trim());
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Failed to load news");
  }
  return res.json();
}

/**
 * Standard TanStack Query options for the market news feed.
 */
export function newsQueryOptions(
  category: NewsFilterTab = "top_stories",
  query: string = ""
) {
  return {
    queryKey: getNewsQueryKey(category, query),
    queryFn: () => fetchMarketNews(category, query),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  };
}
