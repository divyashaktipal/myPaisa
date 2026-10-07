import type { LegalPageData } from "@/types";

export interface LegalPolicyLink {
  label: string;
  href: string;
}

export interface LegalLayoutConfig {
  brandPrefix: string;
  brandSuffix: string;
  brandHref: string;
  backToHomeText: string;
  backToHomeHref: string;
  signInText: string;
  signInHref: string;
  contentsHeading: string;
  keyHighlightsHeading: string;
  exploreOtherPoliciesHeading: string;
  footerCopyrightText: string;
  policyLinks: LegalPolicyLink[];
}

export interface LegalPageLayoutProps {
  data: LegalPageData;
}
