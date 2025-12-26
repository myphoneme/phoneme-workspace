import type { YearlyFinancials } from './types';

// Normalized data (Values converted to INR Lakhs for chart consistency)
export const FINANCIAL_DATA: YearlyFinancials[] = [
  {
    year: '2025',
    revenue: 3376.96,
    profit: 187.25,
    expenses: 3137.47,
    assets: 16553.16,
    liabilities: 9370.72,
    equity: 7182.44,
    currentRatio: 1.46,
    debtEquityRatio: 0.03,
    eps: 1872.59
  },
  {
    year: '2024',
    revenue: 2404.73,
    profit: 188.32,
    expenses: 2174.71,
    assets: 13112.41,
    liabilities: 7802.57,
    equity: 5309.84,
    currentRatio: 1.26,
    debtEquityRatio: 0.48,
    eps: 1883.28
  },
  {
    year: '2023',
    revenue: 1968.58,
    profit: 112.57,
    expenses: 1815.94,
    assets: 15060.45,
    liabilities: 11623.89,
    equity: 3436.56,
    currentRatio: 1.27,
    debtEquityRatio: 0.48,
    eps: 1125.76
  },
  {
    year: '2022',
    revenue: 875.44,
    profit: 40.88,
    expenses: 823.36,
    assets: 1547.04,
    liabilities: 1315.96,
    equity: 231.08,
    currentRatio: 1.11,
    debtEquityRatio: 0.77,
    eps: 408.88
  },
  {
    year: '2021',
    revenue: 1190.23,
    profit: 153.81,
    expenses: 979.98,
    assets: 1246.41,
    liabilities: 1056.22,
    equity: 190.19,
    currentRatio: 0.99,
    debtEquityRatio: 0.98,
    eps: 1538.16
  },
  {
    year: '2020',
    revenue: 750.15,
    profit: 26.12,
    expenses: 707.32,
    assets: 549.94,
    liabilities: 513.56,
    equity: 36.37,
    currentRatio: 1.11,
    debtEquityRatio: 0.19,
    eps: 261.30
  },
  {
    year: '2019',
    revenue: 311.70,
    profit: -13.70,
    expenses: 330.66,
    assets: 208.00,
    liabilities: 197.75,
    equity: 10.24,
    currentRatio: 1.05,
    debtEquityRatio: 0.22,
    eps: -137.07
  }
];

export const DIRECTORS = [
  { name: 'Anuj Kumar', role: 'Director', din: '05347669' },
  { name: 'Sonal Anuj Kulshreshtha', role: 'Director', din: '07065906' }
];

export const CORPORATE_INFO = {
  name: 'Phoneme Solutions Private Limited',
  established: '2015',
  sector: 'IT Services',
  location: 'New Delhi',
  auditors: 'P.S. Kanodia & Co. (Formerly VAP & Co.)',
  standards: 'Indian GAAP'
};
