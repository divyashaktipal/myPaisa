import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OVERVIEW_PAGE_CONFIG } from "@/constants/OverviewPage";
import { DASHBOARD_ROUTE_PAGE_CONFIG } from "@/constants/DashboardRoutePage";

const OverviewPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect(DASHBOARD_ROUTE_PAGE_CONFIG.unauthenticatedRedirect);
  }
  redirect(OVERVIEW_PAGE_CONFIG.redirectTarget);
};

export default OverviewPage;
