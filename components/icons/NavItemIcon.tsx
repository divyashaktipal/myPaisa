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
    case "screener":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox={NAV_ITEM_ICON_CONFIG.viewBox}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      );
    case "watchlist":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox={NAV_ITEM_ICON_CONFIG.viewBox}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    default:
      return null;
  }
};

export default NavItemIcon;
