import type { FooterContent } from "@/types/Footer";

export const FOOTER_CONTENT: FooterContent = {
  copyright: "© 2026 myPaisa. All rights reserved.",
  disclaimer:
    "Disclaimer: myPaisa is an independent personal project developed strictly for educational and informational purposes. It is NOT registered, certified, or regulated by SEBI (Securities and Exchange Board of India) as an Investment Adviser, Research Analyst, Broker, or Portfolio Manager. None of the charts, signals, market data, or content on this platform should be construed as investment, financial, or trading advice. Please consult a SEBI-registered financial professional before executing any trades.",
  links: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
};
