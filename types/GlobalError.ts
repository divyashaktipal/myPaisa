export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface GlobalErrorConfig {
  statusCode: string;
  badge: string;
  title: string;
  description: string;
  retryButtonText: string;
  homeButtonText: string;
  homeHref: string;
}
