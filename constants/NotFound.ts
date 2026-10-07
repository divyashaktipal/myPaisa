import type { NotFoundConfig } from "@/types/NotFound";

export const NOT_FOUND_CONFIG: NotFoundConfig = {
  statusCode: "404",
  badge: "Page Not Found",
  title: "Lost in the Financial Wilderness?",
  description:
    "The market page or resource you are looking for has been moved, renamed, or does not exist.",
  homeButtonText: "Return to Home",
  homeHref: "/",
  dashboardButtonText: "Go to Dashboard",
  dashboardHref: "/dashboard",
  supportHint: "If you believe this is a ticker symbol error, please check the search palette (⌘K).",
};
