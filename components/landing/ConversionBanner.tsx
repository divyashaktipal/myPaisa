import React from "react";
import Link from "next/link";
import { CONVERSION_BANNER_CONTENT } from "@/constants/ConversionBanner";
import type { ConversionBannerProps } from "@/types/ConversionBanner";

const ConversionBanner = (_props: ConversionBannerProps = {}) => {
  return (
    <section
      id="demo"
      className="relative min-h-[460px] flex items-center justify-center text-center overflow-hidden bg-[#244330]"
      data-purpose="cta-banner"
    >
      {/* Sunlit flower meadow background */}
      <img
        alt={CONVERSION_BANNER_CONTENT.bgImageAlt}
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        src={CONVERSION_BANNER_CONTENT.bgImageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 text-white">
        <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
          {CONVERSION_BANNER_CONTENT.badge}
        </span>
        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight mt-3 text-white">
          {CONVERSION_BANNER_CONTENT.titleLine1}
          <br />
          {CONVERSION_BANNER_CONTENT.titleLine2}
        </h2>
        <p className="text-xs sm:text-sm text-gray-200 mt-3 max-w-md mx-auto leading-relaxed">
          {CONVERSION_BANNER_CONTENT.description}
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-lime text-brand-deep font-semibold text-sm hover:bg-brand-lime-hover transition shadow-xl group"
            href={CONVERSION_BANNER_CONTENT.ctaHref}
          >
            <span>{CONVERSION_BANNER_CONTENT.ctaText}</span>
            <span className="w-5 h-5 rounded-full bg-brand-deep text-brand-lime flex items-center justify-center text-xs transition-transform group-hover:translate-x-0.5">
              {CONVERSION_BANNER_CONTENT.ctaArrow}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ConversionBanner;
