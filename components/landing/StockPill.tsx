import React from "react";
import type { StockPillProps } from "@/types/StockPill";
import { STOCK_PILL_CONFIG } from "@/constants/StockPill";

const StockPill = ({ stock, onHover }: StockPillProps) => {
  const isPositive = (stock?.changePercent ?? 0) >= 0;

  return (
    <div
      onMouseEnter={onHover}
      className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#fafbfa] hover:bg-white border border-gray-100 hover:border-emerald-300/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 cursor-pointer shrink-0"
    >
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-900 tracking-tight leading-tight">
          {stock?.symbol}
        </span>
        <span className="text-[10px] text-gray-400 max-w-[110px] truncate leading-tight">
          {stock?.name}
        </span>
      </div>

      <div className="text-right">
        <p className="text-xs font-bold text-gray-900 font-mono tabular-nums leading-tight">
          {STOCK_PILL_CONFIG.currencySymbol}
          {stock?.price?.toLocaleString?.(STOCK_PILL_CONFIG.locale, { minimumFractionDigits: 2 })}
        </p>
        <span
          className={`inline-flex items-center text-[10px] font-semibold tabular-nums leading-tight ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isPositive ? STOCK_PILL_CONFIG.positivePrefix : STOCK_PILL_CONFIG.negativePrefix}
          {stock?.changePercent?.toFixed?.(2)}%
        </span>
      </div>
    </div>
  );
};

export default StockPill;
