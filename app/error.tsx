"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { GLOBAL_ERROR_CONFIG } from "@/constants/GlobalError";
import type { ErrorBoundaryProps } from "@/types/ErrorBoundary";

const ErrorBoundary = ({ error, reset }: ErrorBoundaryProps) => {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070b11] text-white flex flex-col items-center justify-center px-4 py-16 selection:bg-rose-500 selection:text-white">
      <div className="relative max-w-lg w-full text-center">
        {/* Ambient Red Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 via-orange-500/10 to-rose-500/20 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

        <div className="relative rounded-3xl border border-rose-500/20 bg-[#0d141f]/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {GLOBAL_ERROR_CONFIG.statusCode} · {GLOBAL_ERROR_CONFIG.badge}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {GLOBAL_ERROR_CONFIG.title}
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            {error.message || GLOBAL_ERROR_CONFIG.description}
          </p>

          {error.digest && (
            <p className="text-[11px] text-gray-500 font-mono">
              Digest: {error.digest}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              {GLOBAL_ERROR_CONFIG.retryButtonText}
            </button>
            <Link
              href={GLOBAL_ERROR_CONFIG.homeHref}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition border border-white/10"
            >
              {GLOBAL_ERROR_CONFIG.homeButtonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
