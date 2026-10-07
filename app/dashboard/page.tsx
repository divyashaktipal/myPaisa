import { auth } from "@/auth";
import { DashboardPage } from "@/components/dashboard";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE_PAGE_CONFIG } from "@/constants/DashboardRoutePage";
import type { DashboardRoutePageProps } from "@/types/DashboardRoutePage";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await auth();

  // Require Google authentication to access the dashboard
  if (!session?.user) {
    redirect(DASHBOARD_ROUTE_PAGE_CONFIG.unauthenticatedRedirect);
  }

  return <DashboardPage user={session.user} />;
};

export default Page;
