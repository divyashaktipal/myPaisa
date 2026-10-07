import React from "react";
import dynamic from "next/dynamic";
import {
  HeroSection,
  FeaturesSection,
  ConversionBanner,
  Footer,
} from "@/components/landing";
import type { LandingPageProps } from "@/types/LandingPage";
import { LANDING_PAGE_CONFIG } from "@/constants/LandingPage";

// Lazy load India's Top 200 Stocks marquee section with sleek shimmer skeleton
const TrustedPartners = dynamic(
  () => import("@/components/landing/TrustedPartners"),
  {
    loading: () => (
      <div
        aria-label={LANDING_PAGE_CONFIG.skeletonAriaLabel}
        className="py-10 bg-white border-y border-gray-100 animate-pulse overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-6 w-28 bg-emerald-100/60 rounded-full" />
              <div className="h-4 w-44 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="space-y-3 px-4">
          <div className="flex gap-3">
            {[...Array(LANDING_PAGE_CONFIG.skeletonPlaceholderCount)].map((_, i) => (
              <div
                key={i}
                className="h-14 w-44 rounded-2xl bg-gray-100/70 shrink-0"
              />
            ))}
          </div>
          <div className="flex gap-3">
            {[...Array(LANDING_PAGE_CONFIG.skeletonPlaceholderCount)].map((_, i) => (
              <div
                key={i}
                className="h-14 w-44 rounded-2xl bg-gray-100/70 shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const LandingPage = (_props: LandingPageProps = {}) => {
  return (
    <main className="min-h-screen w-full bg-[#fcfdfd] text-[#111827] overflow-x-hidden">
      <HeroSection />
      <TrustedPartners />
      <FeaturesSection />
      <ConversionBanner />
      <Footer />
    </main>
  );
};

export default LandingPage;
