"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { DashboardNavbarProps } from "@/types/DashboardNavbar";
import {
  DASHBOARD_NAV_ITEMS,
  BRAND_LOGO_CONFIG,
  SEARCH_INPUT_CONFIG,
  MARKET_STATUS_BADGE,
  USER_PROFILE_CONFIG,
} from "@/constants/DashboardNavbar";
import { NavItemIcon } from "@/components/icons";

const DashboardNavbar = ({
  user,
  activeTab,
  setActiveTab,
  onOpenSearch,
  watchlistCount = 0,
}: DashboardNavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive active tab from prop or pathname
  const resolvedActiveTab =
    activeTab ||
    (pathname?.startsWith("/dashboard/chart")
      ? "chart"
      : pathname?.startsWith("/dashboard/news")
        ? "news"
        : pathname?.startsWith("/dashboard/signals") || pathname?.startsWith("/dashboard/live/signals")
          ? "signals"
          : pathname?.startsWith("/dashboard/watchlist")
            ? "watchlist"
            : "live");

  // Initial for user avatar (derives only from user name, never exposes email)
  const userInitial =
    user?.name?.charAt?.(0)?.toUpperCase?.() ||
    USER_PROFILE_CONFIG.defaultInitial;

  return (
    <nav className="w-full bg-[#0b1017] border-b border-[#192231] px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href={BRAND_LOGO_CONFIG.href} className="flex items-center gap-0.5 select-none transition hover:opacity-95">
            <span className="text-white font-bold text-xl tracking-tight">{BRAND_LOGO_CONFIG.prefix}</span>
            <span className="text-emerald-400 font-bold text-xl tracking-tight">{BRAND_LOGO_CONFIG.suffix}</span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 bg-[#0f1622] p-1 rounded-xl border border-[#1b2535]">
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const isActive = resolvedActiveTab === item.id;
              const badge = item.id === "watchlist" && watchlistCount > 0 ? watchlistCount : undefined;
              const targetHref = item.href || `/dashboard/${item.id}`;
              return (
                <Link
                  key={item.id}
                  href={targetHref}
                  onClick={() => setActiveTab?.(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isActive
                    ? "bg-[#1d2738] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#16202e]"
                    }`}
                >
                  {item.hasDot ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  ) : (
                    <NavItemIcon id={item.id} />
                  )}
                  <span>{item.label}</span>
                  {badge != null && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search Bar, Market Status Pill, User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Search Input Pill */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2.5 bg-[#0f1724] hover:bg-[#141f30] border border-[#1d293d] hover:border-[#2a3a54] px-3.5 py-1.5 rounded-xl text-xs text-gray-400 transition cursor-pointer min-w-[210px] justify-between shadow-inner"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-gray-400">{SEARCH_INPUT_CONFIG.placeholder}</span>
            </div>
            <kbd className="text-[10px] bg-[#1a2536] px-1.5 py-0.5 rounded text-gray-400 border border-[#27374e] font-mono">
              {SEARCH_INPUT_CONFIG.shortcutKey}
            </kbd>
          </button>

          {/* Market Status Pill */}
          {/* <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f1724] border border-[#1d293d] text-xs text-gray-300">
            <span className={`w-2 h-2 rounded-full ${MARKET_STATUS_BADGE.dotColor}`} />
            <span className="font-medium text-gray-300">{MARKET_STATUS_BADGE.label}</span>
          </div> */}

          {/* User Profile Avatar with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full bg-[#db2777] text-white flex items-center justify-center font-bold text-xs shadow-md border border-white/20 hover:scale-105 transition"
              aria-label="User Profile"
            >
              {userInitial}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111927] border border-[#223147] p-2 text-xs text-white shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#1e2a3c] mb-1">
                  <p className="font-semibold truncate text-white">{user?.name || USER_PROFILE_CONFIG.defaultName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[11px] text-gray-400 font-medium">{USER_PROFILE_CONFIG.accountStatus}</span>
                  </div>
                </div>
                <Link
                  href="/dashboard/watchlist"
                  onClick={() => {
                    setActiveTab?.("watchlist");
                    setProfileOpen(false);
                  }}
                  className="w-full block text-left px-3 py-2 rounded-lg hover:bg-[#1a2638] text-gray-200 transition"
                >
                  {USER_PROFILE_CONFIG.watchlistText} ({watchlistCount})
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: USER_PROFILE_CONFIG.signOutCallbackUrl })}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-400 transition border-t border-[#1e2a3c] mt-1"
                >
                  {USER_PROFILE_CONFIG.signOutText}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-[#0f1724] border border-[#1d293d] text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 p-3 rounded-2xl bg-[#101724] border border-[#1d283c] flex flex-col gap-1.5">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href || `/dashboard/${item.id}`}
              onClick={() => {
                setActiveTab?.(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${resolvedActiveTab === item.id ? "bg-[#1d293d] text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              <NavItemIcon id={item.id} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch?.();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 bg-[#162030] mt-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{SEARCH_INPUT_CONFIG.mobileLabel}</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
