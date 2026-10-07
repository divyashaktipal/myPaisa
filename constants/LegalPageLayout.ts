import type { LegalLayoutConfig } from "@/types/LegalPageLayout";

export const LEGAL_LAYOUT_CONFIG: LegalLayoutConfig = {
  brandPrefix: "my",
  brandSuffix: "Paisa",
  brandHref: "/",
  backToHomeText: "Back to home",
  backToHomeHref: "/",
  signInText: "Sign In",
  signInHref: "/login",
  contentsHeading: "Contents",
  keyHighlightsHeading: "Key Highlights at a Glance",
  exploreOtherPoliciesHeading: "Explore our other policies:",
  footerCopyrightText: "© 2026 myPaisa. All rights reserved. Real-Time Indian Financial Intelligence.",
  policyLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security Architecture", href: "/security" },
  ],
};
