"use client";

import { createContext, useContext } from "react";
import type { DashboardContextValue } from "@/types/DashboardShell";

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export const useDashboard = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardShell/Provider");
  }
  return context;
};
