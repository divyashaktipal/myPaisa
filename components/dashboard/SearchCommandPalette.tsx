"use client";

import React, { useEffect, useState, useMemo } from "react";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";
import type { SearchCommandPaletteProps } from "@/types/SearchCommandPalette";
import {
  SEARCH_PALETTE_CONFIG,
  SEARCH_WATCHLIST_ICONS,
} from "@/constants/SearchCommandPalette";

const SearchCommandPalette = ({
  isOpen,
  onClose,
  watchlist = [],
  onToggleWatchlist,
  onSelectStock,
}: SearchCommandPaletteProps) => {
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      } else if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredStocks = useMemo(() => {
    if (!query?.trim?.()) return TOP_200_INDIAN_STOCKS?.slice?.(0, SEARCH_PALETTE_CONFIG.initialResultsCount) ?? [];
    const q = query?.toLowerCase?.()?.trim?.() ?? "";
    return (
      TOP_200_INDIAN_STOCKS?.filter?.(
        (s) =>
          s?.symbol?.toLowerCase?.()?.includes?.(q) ||
          s?.name?.toLowerCase?.()?.includes?.(q) ||
          s?.sector?.toLowerCase?.()?.includes?.(q)
      )?.slice?.(0, SEARCH_PALETTE_CONFIG.maxQueryResultsCount) ?? []
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0f1724] border border-[#223147] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1f2b3e]">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e?.target?.value ?? "")}
            placeholder={SEARCH_PALETTE_CONFIG.placeholder}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
          />
          <kbd
            onClick={onClose}
            className="text-[10px] bg-[#1a2536] hover:bg-[#25354d] px-2 py-1 rounded text-gray-400 border border-[#2b3a50] cursor-pointer"
          >
            {SEARCH_PALETTE_CONFIG.escLabel}
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#172233]">
          {(filteredStocks?.length ?? 0) === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              {SEARCH_PALETTE_CONFIG.noResultsMessagePrefix}&quot;{query}&quot;
            </div>
          ) : (
            filteredStocks?.map?.((stock) => {
              const isWatchlisted = watchlist?.includes?.(stock?.symbol);
              const isPositive = (stock?.changePercent ?? 0) >= 0;

              return (
                <div
                  key={stock?.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#162132] transition cursor-pointer group"
                  onClick={() => {
                    onSelectStock?.(stock);
                    onClose?.();
                  }}
                >
                  <div className="flex items-center gap-3">
                    {onToggleWatchlist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e?.stopPropagation?.();
                          onToggleWatchlist?.(stock?.symbol);
                        }}
                        className={`text-base cursor-pointer ${
                          isWatchlisted ? "text-amber-400" : "text-gray-600 hover:text-gray-300"
                        }`}
                      >
                        {isWatchlisted
                          ? SEARCH_WATCHLIST_ICONS.active
                          : SEARCH_WATCHLIST_ICONS.inactive}
                      </button>
                    )}
                    <div>
                      <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition">
                        {stock?.symbol}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[240px]">
                        {stock?.name} {stock?.sector && `· ${stock?.sector}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-sm font-semibold text-white">
                      {SEARCH_PALETTE_CONFIG.currencySymbol}
                      {stock?.price?.toLocaleString?.(SEARCH_PALETTE_CONFIG.locale, { minimumFractionDigits: 2 })}
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {stock?.changePercent?.toFixed?.(2)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#0b1018] border-t border-[#1a2536] flex items-center justify-between text-[11px] text-gray-500">
          <span>{SEARCH_PALETTE_CONFIG.footerSource}</span>
          <span>{SEARCH_PALETTE_CONFIG.footerHint}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchCommandPalette;
