import React from "react";
import { securityData } from "@/lib/legalData";
import { LegalPageLayout } from "@/components/legal";
import { SECURITY_PAGE_METADATA } from "@/constants/SecurityPage";
import type { SecurityPageProps } from "@/types/SecurityPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: SECURITY_PAGE_METADATA.title,
  description: SECURITY_PAGE_METADATA.description,
};

const SecurityPage = () => {
  return <LegalPageLayout data={securityData} />;
};

export default SecurityPage;
