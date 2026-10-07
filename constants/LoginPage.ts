import type { LoginPageConfig } from "@/types/LoginPage";

export const LOGIN_PAGE_CONFIG: LoginPageConfig = {
  brandPrefix: "my",
  brandSuffix: "Paisa",
  backToHomeText: "Back to home",
  backToHomeHref: "/",
  badgeText: "Secure Sign In",
  titleText: "Sign in to myPaisa",
  subtitleText:
    "Continue with your Google account to access real-time charts, Indian market screeners, and custom watchlists.",
  privacyCardTitle: "Your Data is Strictly Private",
  privacyPoints: [
    {
      title: "Never Shared or Sold:",
      desc: "We do not sell or share your watchlists, portfolio, or queries with any third parties or brokers.",
    },
    {
      title: "Minimal Access:",
      desc: "We only access your basic Google name & email to secure your personal session.",
    },
    {
      title: "Zero Spam:",
      desc: "No promotional calls, marketing spam, or intrusive tracking pixels.",
    },
  ],
  termsAgreementText: "By signing in, you agree to our ",
  termsLinkText: "Terms of Service",
  termsHref: "/terms",
  privacyLinkText: "Privacy Policy",
  privacyHref: "/privacy",
  footerBrandText: "myPaisa · Real-Time Indian Financial Intelligence",
  footerLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
  oauthErrorNotices: {
    OAuthAccountNotLinked: {
      title: "Account link refreshed",
      message:
        "Your account has been refreshed for automatic linking. Please click below to sign in.",
    },
    default: {
      title: "Sign-in notice",
      message: "Please continue with your Google account to log in.",
    },
  },
  dashboardRedirect: "/dashboard",
};
