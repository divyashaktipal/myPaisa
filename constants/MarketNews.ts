export const NEWS_FILTER_TABS = [
  { id: "top_stories", label: "Top stories" },
  { id: "movers", label: "Today's movers" },
  { id: "signals", label: "Signals" },
  { id: "nifty50", label: "Nifty 50" },
  { id: "nifty100", label: "Nifty 100" },
  { id: "nifty200", label: "Nifty 200" },
] as const;

export const MARKET_NEWS_HEADER = {
  titlePrefix: "today, in ",
  titleHighlight: "markets.",
  subtitle: "Stories, Shorts and videos from India's business newsrooms, about the Nifty 200. Showing: ",
  searchPlaceholder: "Type a stock name or symbol",
  stockFilterButton: "A stock",
  leadStoryTag: "LEAD STORY",
  shortsTag: "SHORTS",
  shortsTitle: "Quick takes, under a minute",
  storiesTag: "READ",
  storiesTitle: "The latest stories",
};
