"use client";

import React, { useEffect } from "react";
import { GLOBAL_ERROR_CONFIG } from "@/constants/GlobalError";
import type { GlobalErrorProps } from "@/types/GlobalError";

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    console.error("Critical root error caught by global-error.tsx:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070b11] text-white flex flex-col items-center justify-center px-4 font-sans antialiased">
        <div className="max-w-md w-full text-center p-8 rounded-3xl border border-rose-500/20 bg-[#0d141f] shadow-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-mono">
            {GLOBAL_ERROR_CONFIG.statusCode} · Critical Error
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {GLOBAL_ERROR_CONFIG.title}
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            {error.message || GLOBAL_ERROR_CONFIG.description}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            {GLOBAL_ERROR_CONFIG.retryButtonText}
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
