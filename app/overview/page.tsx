import { redirect } from "next/navigation";
import { OVERVIEW_PAGE_CONFIG } from "@/constants/OverviewPage";
import type { OverviewPageProps } from "@/types/OverviewPage";

export const dynamic = "force-dynamic";

const OverviewPage = () => {
  redirect(OVERVIEW_PAGE_CONFIG.redirectTarget);
};

export default OverviewPage;
