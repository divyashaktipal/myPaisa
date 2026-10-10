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

  // Strict route protection: user cannot access dashboard or its sub-routes without logging in
  if (!session?.user) {
    redirect(DASHBOARD_ROUTE_PAGE_CONFIG.unauthenticatedRedirect);
  }

  // Safe client representation: strictly prevent personal email or sensitive PII from leaking to client DOM
  const user = {
    name: session.user.name || "Member",
    email: null,
    image: session.user.image || null,
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
