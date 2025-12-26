export interface YearlyFinancials {
  year: string;
  revenue: number; // In Lakhs
  profit: number; // In Lakhs
  expenses: number; // In Lakhs
  assets: number; // In Lakhs
  liabilities: number; // In Lakhs
  equity: number; // In Lakhs
  currentRatio: number;
  debtEquityRatio: number;
  eps: number;
}

export const SectionType = {
  OVERVIEW: 'Overview',
  PERFORMANCE: 'Performance',
  ASSETS: 'Assets',
  LIABILITIES: 'Liabilities',
  REGULATORY: 'Regulatory',
  DATA_TABLE: 'Raw Data'
} as const;

export type SectionType = typeof SectionType[keyof typeof SectionType];
