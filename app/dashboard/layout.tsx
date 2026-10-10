import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE_PAGE_CONFIG } from "@/constants/DashboardRoutePage";
import { DashboardShell } from "@/components/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // In production, require Google authentication to access the dashboard routes
  if (!session?.user && process.env.NODE_ENV !== "development") {
    redirect(DASHBOARD_ROUTE_PAGE_CONFIG.unauthenticatedRedirect);
  }

  const user = session?.user || {
    name: "Trader",
    email: "trader@mypaisa.com",
    image: null,
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
