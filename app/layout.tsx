import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ROOT_LAYOUT_METADATA } from "@/constants/RootLayout";
import type { RootLayoutProps } from "@/types/RootLayout";
import { QueryProvider } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: ROOT_LAYOUT_METADATA.title,
  description: ROOT_LAYOUT_METADATA.description,
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang={ROOT_LAYOUT_METADATA.lang} className={inter.variable} suppressHydrationWarning>
      <body
        className="bg-[#fcfdfd] text-[#111827] font-sans antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
