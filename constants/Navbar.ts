import type { NavLinkItem, LandingNavbarConfig } from "@/types/Navbar";

export const LANDING_NAV_LINKS: NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Markets", href: "#stocks-ticker" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "/security" },
];

export const LANDING_NAVBAR_CONFIG: LandingNavbarConfig = {
  brandPrefix: "my",
  brandSuffix: "Paisa",
  brandHref: "/",
  signInLabel: "Sign In",
  signInHref: "/login",
};
