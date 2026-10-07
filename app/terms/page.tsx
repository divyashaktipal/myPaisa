import React from "react";
import { termsData } from "@/lib/legalData";
import { LegalPageLayout } from "@/components/legal";
import { TERMS_PAGE_METADATA } from "@/constants/TermsPage";
import type { TermsPageProps } from "@/types/TermsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: TERMS_PAGE_METADATA.title,
  description: TERMS_PAGE_METADATA.description,
};

const TermsPage = () => {
  return <LegalPageLayout data={termsData} />;
};

export default TermsPage;
