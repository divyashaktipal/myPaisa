"use client";

import React from "react";
import type { StatusBannerProps } from "@/types/StatusBanner";
import { STATUS_BANNER_CONFIG } from "@/constants/StatusBanner";

const StatusBanner = ({
  statusText,
  timestamp,
}: StatusBannerProps) => {
  if (!statusText && !timestamp) return null;

  return (
    <div className="w-full rounded-2xl bg-[#0e1622] border border-[#1b2637] p-4 sm:p-5 flex items-start sm:items-center gap-3 shadow-sm">
      <span className={`w-2.5 h-2.5 rounded-full ${STATUS_BANNER_CONFIG.pulseDotColor} mt-1 sm:mt-0 shrink-0 animate-pulse`} />
      <div>
        {statusText && (
          <h2 className="font-bold text-white text-sm sm:text-base tracking-tight leading-snug">
            {statusText}
          </h2>
        )}
        {timestamp && (
          <p className="text-gray-400 text-xs mt-0.5 leading-snug font-mono">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusBanner;
