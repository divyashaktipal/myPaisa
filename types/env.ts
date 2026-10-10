export interface EnvConfig {
  readonly SERPAPI_KEY: string;
  readonly MONGODB_URI: string;
  readonly AUTH_SECRET: string;
  readonly NEXTAUTH_SECRET: string;
  readonly AUTH_URL: string;
  readonly NEXTAUTH_URL: string;
  readonly AUTH_GOOGLE_ID: string;
  readonly AUTH_GOOGLE_SECRET: string;
  readonly NODE_ENV: string;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly GA_ID: string;
  readonly CLARITY_ID: string;
}
