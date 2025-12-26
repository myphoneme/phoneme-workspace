import { useState } from 'react';
import { Building2, Share2, Check, ArrowLeft, Download } from 'lucide-react';
import { FINANCIAL_DATA, CORPORATE_INFO } from './constants';
import {
  CorporateOverview,
  PerformanceAnalysis,
  AssetAnalysis,
  LiabilityAnalysis,
  RegulatoryCompliance,
  RawDataTable
} from './components';

interface FinancialInsightsProps {
  onBack?: () => void;
  isPublic?: boolean;
}

export function FinancialInsights({ onBack, isPublic = false }: FinancialInsightsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/financials/public`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    // For now, trigger print dialog which allows saving as PDF
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back button and Logo */}
            <div className="flex items-center gap-4">
              {onBack && !isPublic && (
                <button
                  onClick={onBack}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">Phoneme Solutions</h1>
                  <p className="text-xs text-slate-500">Financial Insights Dashboard</p>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                <span className="text-xs text-slate-500">Latest Revenue</span>
                <span className="font-bold text-orange-600">₹{FINANCIAL_DATA[0].revenue.toFixed(2)} L</span>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>

              {!isPublic && (
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                  <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Page with all sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Section 1: Corporate Overview */}
        <section id="overview">
          <SectionHeader
            title="Corporate Overview"
            subtitle="Key financial metrics and company information"
          />
          <CorporateOverview />
        </section>

        {/* Section 2: Performance Analysis */}
        <section id="performance">
          <SectionHeader
            title="Performance Analysis"
            subtitle="Revenue trends, expenses, and earnings analysis"
          />
          <PerformanceAnalysis />
        </section>

        {/* Section 3: Asset Analysis */}
        <section id="assets">
          <SectionHeader
            title="Asset Analysis"
            subtitle="Asset base expansion and portfolio composition"
          />
          <AssetAnalysis />
        </section>

        {/* Section 4: Equity & Liabilities */}
        <section id="liabilities">
          <SectionHeader
            title="Equity & Liabilities"
            subtitle="Capital structure and solvency analysis"
          />
          <LiabilityAnalysis />
        </section>

        {/* Section 5: Regulatory Compliance */}
        <section id="regulatory">
          <SectionHeader
            title="Regulatory Compliance"
            subtitle="Statutory framework and liquidity ratios"
          />
          <RegulatoryCompliance />
        </section>

        {/* Section 6: Raw Data Table */}
        <section id="data">
          <SectionHeader
            title="Financial Data"
            subtitle="Complete historical data with export options"
          />
          <RawDataTable />
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-200 print:hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} {CORPORATE_INFO.name}. All rights reserved.</p>
            <p>Data as per audited financial statements • Standards: {CORPORATE_INFO.standards}</p>
          </div>
        </footer>
      </main>

      {/* Quick Navigation - Fixed on right side */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 print:hidden">
        <QuickNavItem href="#overview" label="Overview" />
        <QuickNavItem href="#performance" label="Performance" />
        <QuickNavItem href="#assets" label="Assets" />
        <QuickNavItem href="#liabilities" label="Liabilities" />
        <QuickNavItem href="#regulatory" label="Regulatory" />
        <QuickNavItem href="#data" label="Data" />
      </nav>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

function QuickNavItem({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-3 py-2 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-orange-600 hover:border-orange-200 transition-colors shadow-sm"
    >
      {label}
    </a>
  );
}

// Public version component for external sharing
export function PublicFinancialInsights() {
  return <FinancialInsights isPublic={true} />;
}
