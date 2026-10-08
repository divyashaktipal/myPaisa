"use client";

import React from "react";
import Link from "next/link";
import type { UnderDevelopmentSectionProps } from "@/types/UnderDevelopmentSection";
import { UNDER_DEVELOPMENT_CONFIGS } from "@/constants/UnderDevelopmentSection";

const UnderDevelopmentSection = ({
  tabName,
  badgeLabel,
  title,
  description,
  features,
  estimatedRelease,
}: Partial<UnderDevelopmentSectionProps> & { tabName: string }) => {
  const fallbackConfig = UNDER_DEVELOPMENT_CONFIGS[tabName] || {
    tabName,
    badgeLabel: "Under Active Development",
    title: `${tabName.charAt(0).toUpperCase() + tabName.slice(1)} Module`,
    description: "This feature is currently in active development by the engineering team.",
    features: [],
    estimatedRelease: "Coming Soon",
  };

  const finalBadgeLabel = badgeLabel || fallbackConfig.badgeLabel;
  const finalTitle = title || fallbackConfig.title;
  const finalDescription = description || fallbackConfig.description;
  const finalFeatures = features || fallbackConfig.features || [];
  const finalEstimatedRelease = estimatedRelease || fallbackConfig.estimatedRelease;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Main Glass Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0f1725] to-[#0a0f19] border border-[#1b273b] p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Ambient Gradient Blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-700/60 text-amber-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="tracking-wide uppercase font-mono text-[11px]">{finalBadgeLabel}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {finalTitle}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
            {finalDescription}
          </p>

          {finalEstimatedRelease && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-lg">
              <span>🚀</span>
              <span>{finalEstimatedRelease}</span>
            </div>
          )}

          {/* Quick Route Switches */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/live"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <span>🔴</span>
              <span>Go to Live Markets</span>
            </Link>
            <Link
              href="/dashboard/chart"
              className="px-4 py-2.5 rounded-xl bg-[#152031] hover:bg-[#1c2c43] text-gray-200 border border-[#24354e] font-semibold text-xs transition flex items-center gap-2"
            >
              <span>📈</span>
              <span>Open Stock Charts</span>
            </Link>
            <Link
              href="/dashboard/watchlist"
              className="px-4 py-2.5 rounded-xl bg-[#111824] hover:bg-[#182334] text-gray-400 hover:text-gray-200 border border-[#1e2a3c] font-semibold text-xs transition flex items-center gap-2"
            >
              <span>⭐</span>
              <span>View Watchlist</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Capabilities Roadmap Preview */}
      {finalFeatures.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
              Upcoming Capabilities
            </h2>
            <span className="text-[11px] text-gray-500 font-mono">In Progress</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {finalFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0c121d] border border-[#172336] p-5 hover:border-[#22354f] transition group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#131d2e] border border-[#1f2e46] flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderDevelopmentSection;
