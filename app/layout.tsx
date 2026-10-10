import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ROOT_LAYOUT_METADATA } from "@/constants/RootLayout";
import type { RootLayoutProps } from "@/types/RootLayout";
import { QueryProvider, AnalyticsProvider } from "@/components/providers";
import { env } from "@/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: ROOT_LAYOUT_METADATA.title,
  description: ROOT_LAYOUT_METADATA.description,
  icons: ROOT_LAYOUT_METADATA.icons,
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang={ROOT_LAYOUT_METADATA.lang} className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className="bg-[#fcfdfd] text-[#111827] font-sans antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        <QueryProvider>{children}</QueryProvider>
        <AnalyticsProvider
          gaId={env.GA_ID}
          clarityId={env.CLARITY_ID}
        />
      </body>
    </html>
  );
};

export default RootLayout;
