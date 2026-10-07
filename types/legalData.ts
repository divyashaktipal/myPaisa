export interface LegalSection {
  id: string;
  title: string;
  content: string;
  bullets?: string[];
}

export interface LegalSummaryItem {
  label: string;
  text: string;
}

export type LegalHighlight = LegalSummaryItem;

export interface LegalPageData {
  badge: string;
  title: string;
  description: string;
  lastUpdated: string;
  effectiveDate: string;
  quickSummary: LegalSummaryItem[];
  sections: LegalSection[];
}
