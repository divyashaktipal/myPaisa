"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WatchlistSection, useDashboard } from "@/components/dashboard";
import type { StockItem } from "@/types/top200Stocks";

export const dynamic = "force-dynamic";

const WatchlistPage = () => {
  const router = useRouter();
  const { watchlist, toggleWatchlist, openSearch } = useDashboard();

  const handleSelectStock = (stock: StockItem) => {
    if (stock?.symbol) {
      router.push(`/dashboard/chart?symbol=${encodeURIComponent(stock.symbol)}`);
    }
  };

  return (
    <div className="w-full space-y-6">
      <WatchlistSection
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
        onOpenSearch={openSearch}
        onSelectStock={handleSelectStock}
      />
    </div>
  );
};

export default WatchlistPage;
