import type { GlobalErrorConfig } from "@/types/GlobalError";

export const GLOBAL_ERROR_CONFIG: GlobalErrorConfig = {
  statusCode: "500",
  badge: "System Error",
  title: "Something Went Wrong",
  description:
    "An unexpected error occurred while processing market intelligence or rendering this view.",
  retryButtonText: "Try Again",
  homeButtonText: "Return to Home",
  homeHref: "/",
};
