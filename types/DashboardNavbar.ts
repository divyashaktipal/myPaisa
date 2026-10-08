export interface DashboardUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface DashboardNavItemConfig {
  id: string;
  label: string;
  hasDot?: boolean;
  href?: string;
}

export interface BrandLogoConfig {
  prefix: string;
  suffix: string;
  href: string;
}

export interface SearchInputConfig {
  placeholder: string;
  shortcutKey: string;
  mobileLabel: string;
}

export interface MarketStatusBadgeConfig {
  label: string;
  dotColor: string;
}

export interface UserProfileConfig {
  defaultName: string;
  defaultEmail: string;
  defaultInitial: string;
  watchlistText: string;
  signOutText: string;
  signOutCallbackUrl: string;
}

export interface DashboardNavbarProps {
  user?: DashboardUser | null;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenSearch?: () => void;
  watchlistCount?: number;
}
