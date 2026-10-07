"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import { HERO_CONTENT } from "@/constants/HeroSection";
import type { HeroSectionProps } from "@/types/HeroSection";

const HeroSection = (_props: HeroSectionProps = {}) => {
  return (
    <header className="relative w-full overflow-hidden bg-gradient-to-b from-[#194030] via-[#245741] to-[#608752] text-white pb-20 md:pb-28">
      {/* Atmospheric rolling green landscape background representation */}
      <div
        className="absolute inset-0 bg-cover bg-bottom opacity-90 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 60%), linear-gradient(180deg, rgba(16,40,30,0.85) 0%, rgba(32,77,57,0.4) 45%, rgba(67,105,62,0.9) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent z-10" />

      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center px-4 pt-16 md:pt-24 pb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
          {HERO_CONTENT.titleLine1}
          <br />
          <span className="font-medium">{HERO_CONTENT.titleLine2}</span>
        </h1>
        <p className="mt-5 text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
          {HERO_CONTENT.subtitle}
        </p>

        {/* Main Action Button */}
        <div className="mt-8 flex justify-center">
          <Link
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-lime text-brand-deep font-semibold text-sm hover:bg-brand-lime-hover transition shadow-lg shadow-black/10 group"
            href={HERO_CONTENT.ctaHref}
          >
            <span>{HERO_CONTENT.ctaText}</span>
            <span className="w-5 h-5 rounded-full bg-brand-deep text-brand-lime flex items-center justify-center text-xs transition-transform group-hover:translate-x-0.5">
              {HERO_CONTENT.ctaArrow}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
