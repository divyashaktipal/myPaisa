import React from "react";
import { privacyData } from "@/lib/legalData";
import { LegalPageLayout } from "@/components/legal";
import { PRIVACY_PAGE_METADATA } from "@/constants/PrivacyPage";
import type { PrivacyPageProps } from "@/types/PrivacyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: PRIVACY_PAGE_METADATA.title,
  description: PRIVACY_PAGE_METADATA.description,
};

const PrivacyPage = () => {
  return <LegalPageLayout data={privacyData} />;
};

export default PrivacyPage;
