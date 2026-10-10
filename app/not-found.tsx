import React from "react";
import Link from "next/link";
import { NOT_FOUND_CONFIG } from "@/constants/NotFound";
import type { NotFoundProps } from "@/types/NotFound";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070b11] text-white flex flex-col items-center justify-center px-4 py-16 selection:bg-emerald-500 selection:text-black">
      <div className="relative max-w-lg w-full text-center">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

        <div className="relative rounded-3xl border border-white/10 bg-[#0d141f]/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {NOT_FOUND_CONFIG.statusCode} · {NOT_FOUND_CONFIG.badge}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {NOT_FOUND_CONFIG.title}
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            {NOT_FOUND_CONFIG.description}
          </p>

          <p className="text-xs text-gray-500 font-mono">
            {NOT_FOUND_CONFIG.supportHint}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={NOT_FOUND_CONFIG.dashboardHref}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition shadow-lg shadow-emerald-500/20"
            >
              {NOT_FOUND_CONFIG.dashboardButtonText}
            </Link>
            <Link
              href={NOT_FOUND_CONFIG.homeHref}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition border border-white/10"
            >
              {NOT_FOUND_CONFIG.homeButtonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
