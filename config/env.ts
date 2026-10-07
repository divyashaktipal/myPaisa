import type { EnvConfig } from "@/types/env";

export const env: EnvConfig = {
  SERPAPI_KEY: process.env.SERPAPI_KEY || "",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myPaisa",
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "",
  AUTH_URL: process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000",
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || "",
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",
};

export default env;
