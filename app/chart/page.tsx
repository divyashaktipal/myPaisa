import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE_PAGE_CONFIG } from "@/constants/DashboardRoutePage";

export default async function ChartRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect(DASHBOARD_ROUTE_PAGE_CONFIG.unauthenticatedRedirect);
  }
  redirect("/dashboard/chart");
}
