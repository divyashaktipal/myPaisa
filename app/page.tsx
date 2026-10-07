import { auth } from "@/auth";
import { LandingPage } from "@/components/landing";
import { redirect } from "next/navigation";
import { HOME_PAGE_CONFIG } from "@/constants/HomePage";
import type { HomePageProps } from "@/types/HomePage";

const HomePage = async () => {
  const session = await auth();
  if (session) redirect(HOME_PAGE_CONFIG.authenticatedRedirect);
  return <LandingPage />;
};

export default HomePage;
