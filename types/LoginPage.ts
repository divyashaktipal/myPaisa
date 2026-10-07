export interface LoginPageProps {
  searchParams?: Promise<{ error?: string }>;
}

export interface OAuthErrorNotice {
  title: string;
  message: string;
}

export interface PrivacyPoint {
  title: string;
  desc: string;
}

export interface LoginPageConfig {
  brandPrefix: string;
  brandSuffix: string;
  backToHomeText: string;
  backToHomeHref: string;
  badgeText: string;
  titleText: string;
  subtitleText: string;
  privacyCardTitle: string;
  privacyPoints: PrivacyPoint[];
  termsAgreementText: string;
  termsLinkText: string;
  termsHref: string;
  privacyLinkText: string;
  privacyHref: string;
  footerBrandText: string;
  footerLinks: Array<{ label: string; href: string }>;
  oauthErrorNotices: {
    OAuthAccountNotLinked: OAuthErrorNotice;
    default: OAuthErrorNotice;
  };
  dashboardRedirect: string;
}
