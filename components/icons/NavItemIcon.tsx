import React from "react";
import type { NavItemIconProps } from "@/types/NavItemIcon";
import { NAV_ITEM_ICON_CONFIG } from "@/constants/NavItemIcon";

const NavItemIcon = ({ id, className = NAV_ITEM_ICON_CONFIG.defaultClassName }: NavItemIconProps) => {
  switch (id) {
    case "live":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox={NAV_ITEM_ICON_CONFIG.viewBox}>
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
        </svg>
      );
    case "chart":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox={NAV_ITEM_ICON_CONFIG.viewBox}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "news":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox={NAV_ITEM_ICON_CONFIG.viewBox}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    case "signals":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox={NAV_ITEM_ICON_CONFIG.viewBox}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "watchlist":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox={NAV_ITEM_ICON_CONFIG.viewBox}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      );
    default:
      return null;
  }
};

export default NavItemIcon;
