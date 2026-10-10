export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContent {
  copyright: string;
  disclaimer: string;
  links: FooterLink[];
}

export interface FooterProps {}
