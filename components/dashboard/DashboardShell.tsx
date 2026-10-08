"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardNavbar, SearchCommandPalette } from "@/components/dashboard";
import { DashboardContext } from "./DashboardContext";
import type { DashboardShellProps, DashboardContextValue } from "@/types/DashboardShell";
import type { StockItem } from "@/types/top200Stocks";
import {
  DEFAULT_DASHBOARD_STATE,
  DASHBOARD_API_ROUTES,
  WATCHLIST_UPDATE_ERROR,
  QUERY_CLIENT_CONFIG,
} from "@/constants";

const DashboardShell = ({ user, children }: DashboardShellProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [watchlistNotification, setWatchlistNotification] = useState<string | null>(null);

  // Global Keyboard listener: ⌘K or Ctrl+K to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // TanStack React Query: Cached Watchlist query
  const { data: watchlistData } = useQuery<{ success: boolean; symbols: string[] }>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetch(DASHBOARD_API_ROUTES.watchlist);
      if (!res?.ok) {
        if (res?.status === 401) {
          console.warn("Watchlist: user unauthenticated, running in guest mode.");
        }
        return { success: false, symbols: [...DEFAULT_DASHBOARD_STATE.initialWatchlist] };
      }
      return res.json();
    },
    staleTime: QUERY_CLIENT_CONFIG?.watchlistStaleTime ?? 300000,
    gcTime: QUERY_CLIENT_CONFIG?.defaultGcTime ?? 3600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const watchlist =
    watchlistData?.symbols && Array.isArray(watchlistData?.symbols)
      ? watchlistData.symbols
      : DEFAULT_DASHBOARD_STATE.initialWatchlist;

  // TanStack React Query: Optimistic Watchlist Mutation with rollback
  const toggleWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(DASHBOARD_API_ROUTES.watchlist, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (!res?.ok) {
        const status = res?.status ?? 500;
        const err = new Error(
          status === 401
            ? "Sign in required to persist watchlist across sessions."
            : WATCHLIST_UPDATE_ERROR
        );
        (err as unknown as { status: number }).status = status;
        throw err;
      }
      return res.json();
    },
    onMutate: async (symbol: string) => {
      setWatchlistNotification(null);
      await queryClient.cancelQueries({ queryKey: ["watchlist"] });
      const previous = queryClient.getQueryData<{ success: boolean; symbols: string[] }>(["watchlist"]);
      const previousSymbols = previous?.symbols ?? [...DEFAULT_DASHBOARD_STATE.initialWatchlist];

      const exists = previousSymbols.includes(symbol);
      const nextSymbols = exists
        ? previousSymbols.filter((s) => s !== symbol)
        : [...previousSymbols, symbol];

      queryClient.setQueryData(["watchlist"], {
        success: true,
        symbols: nextSymbols,
      });

      return { previousSymbols };
    },
    onError: (err: unknown, _symbol, context) => {
      if (context?.previousSymbols) {
        queryClient.setQueryData(["watchlist"], {
          success: true,
          symbols: context.previousSymbols,
        });
      }
      const message = err instanceof Error ? err.message : WATCHLIST_UPDATE_ERROR;
      setWatchlistNotification(message);
    },
    onSuccess: (result) => {
      if (result?.symbols && Array.isArray(result?.symbols)) {
        queryClient.setQueryData(["watchlist"], {
          success: true,
          symbols: result.symbols,
        });
      }
    },
  });

  const handleToggleWatchlist = (symbol: string) => {
    toggleWatchlistMutation.mutate(symbol);
  };

  const handleSelectStock = (stock: StockItem) => {
    if (stock?.symbol) {
      setIsSearchOpen(false);
      router.push(`/dashboard/chart?symbol=${encodeURIComponent(stock.symbol)}`);
    }
  };

  const contextValue: DashboardContextValue = {
    user,
    watchlist,
    isSearchOpen,
    openSearch: () => setIsSearchOpen(true),
    closeSearch: () => setIsSearchOpen(false),
    toggleWatchlist: handleToggleWatchlist,
    watchlistNotification,
    dismissWatchlistNotification: () => setWatchlistNotification(null),
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#070b11] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
        {/* Universal Sticky Dashboard Navbar */}
        <DashboardNavbar
          user={user}
          onOpenSearch={() => setIsSearchOpen(true)}
          watchlistCount={watchlist?.length ?? 0}
        />

        {/* Global Watchlist Toast Alert */}
        {watchlistNotification && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
            <div className="w-full rounded-2xl bg-amber-950/40 border border-amber-800/60 p-3.5 flex items-center justify-between text-amber-200 text-xs shadow-lg animate-in fade-in duration-150">
              <span>{watchlistNotification}</span>
              <button
                type="button"
                onClick={() => setWatchlistNotification(null)}
                className="text-amber-400 hover:text-amber-200 text-sm ml-2 cursor-pointer font-bold"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Active Page View Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          {children}
        </main>

        {/* ⌘K Global Search Command Palette */}
        <SearchCommandPalette
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onSelectStock={handleSelectStock}
        />
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardShell;
