import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE_PAGE_CONFIG } from "@/constants/DashboardRoutePage";
import { DashboardShell } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Require authentication to access the dashboard routes
  if (!session?.user) {
    redirect(DASHBOARD_ROUTE_PAGE_CONFIG.unauthenticatedRedirect);
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
