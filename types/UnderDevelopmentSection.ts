export interface UnderDevelopmentFeature {
  icon: string;
  title: string;
  description: string;
}

export interface UnderDevelopmentSectionProps {
  tabName: "news" | "screener" | string;
  badgeLabel?: string;
  title?: string;
  description?: string;
  features?: UnderDevelopmentFeature[];
  estimatedRelease?: string;
}
