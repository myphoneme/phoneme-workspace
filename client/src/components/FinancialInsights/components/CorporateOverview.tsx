import React, { useState, useMemo } from 'react';
import { Calendar, Download, FileText, Percent, Activity, Briefcase, TrendingUp, Wallet } from 'lucide-react';
import { Card, MetricCard } from './Card';
import { FINANCIAL_DATA, CORPORATE_INFO, DIRECTORS } from '../constants';

export const CorporateOverview: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>(FINANCIAL_DATA[0].year);

  const yearData = useMemo(() =>
    FINANCIAL_DATA.find(d => d.year === selectedYear) || FINANCIAL_DATA[0],
    [selectedYear]
  );

  // Calculations for ROE & ROCE
  const roe = (yearData.profit / yearData.equity) * 100;
  const debt = yearData.equity * yearData.debtEquityRatio;
  const capitalEmployed = yearData.equity + debt;
  const roce = (yearData.profit / capitalEmployed) * 100;

  const handleDownloadCSV = () => {
    const headers = "Year,Revenue,Expenses,Profit,Assets,Liabilities,Equity,CurrentRatio,DebtEquityRatio,EPS\n";
    const rows = FINANCIAL_DATA.map(d =>
      `${d.year},${d.revenue},${d.expenses},${d.profit},${d.assets},${d.liabilities},${d.equity},${d.currentRatio},${d.debtEquityRatio},${d.eps}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Phoneme_Financials_2015_2025.csv`;
    a.click();
  };

  const downloadBalanceSheet = (year: string) => {
    alert(`Downloading Balance Sheet for Financial Year ${year}...`);
  };

  return (
    <div className="space-y-6">
      {/* Year Selection Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <Calendar size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Select Reporting Period</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none outline-none font-black text-slate-800 py-0 cursor-pointer focus:ring-0 text-base"
            >
              {FINANCIAL_DATA.map(d => (
                <option key={d.year} value={d.year}>FY {d.year} Analysis</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
          >
            <Download size={16} /> CSV
          </button>
          <button
            onClick={() => downloadBalanceSheet(selectedYear)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all font-medium text-sm"
          >
            <FileText size={16} /> FY {selectedYear}
          </button>
        </div>
      </div>

      {/* Primary Financial Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`₹${yearData.revenue.toLocaleString()} L`}
          icon={<Briefcase size={20} />}
          color="bg-orange-50 text-orange-600"
          subValue="Gross income from services"
        />
        <MetricCard
          label="Operating Profit"
          value={`₹${yearData.profit.toLocaleString()} L`}
          icon={<TrendingUp size={20} />}
          color="bg-emerald-50 text-emerald-600"
          subValue={`Margin: ${((yearData.profit/yearData.revenue)*100).toFixed(1)}%`}
        />
        <MetricCard
          label="Total Expenditure"
          value={`₹${yearData.expenses.toLocaleString()} L`}
          icon={<Activity size={20} />}
          color="bg-amber-50 text-amber-600"
          subValue={`${((yearData.expenses/yearData.revenue)*100).toFixed(1)}% of Revenue`}
        />
        <MetricCard
          label="Net Asset Value"
          value={`₹${yearData.assets.toLocaleString()} L`}
          icon={<Wallet size={20} />}
          color="bg-purple-50 text-purple-600"
          subValue="Consolidated asset base"
        />
      </div>

      {/* Return Analysis & Historical Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card title="Profitability Ratios (ROE & ROCE)" className="lg:col-span-1">
          <div className="space-y-8 mt-4">
            {/* ROE Gauge */}
            <div className="relative group">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Percent size={16} className="text-orange-500" />
                  <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">Return on Equity</span>
                </div>
                <span className={`text-xl font-black ${roe > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {roe.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${Math.min(Math.max(roe, 0), 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Calc: (Net Income / Shareholder Equity)</p>
            </div>

            {/* ROCE Gauge */}
            <div className="relative group">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">Return on Cap. Emp.</span>
                </div>
                <span className={`text-xl font-black ${roce > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {roce.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${Math.min(Math.max(roce, 0), 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Calc: EBIT / (Equity + Long-term Debt)</p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Equity</p>
                  <p className="text-sm font-black text-slate-800">₹{yearData.equity.toLocaleString()} L</p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Capital Emp.</p>
                  <p className="text-sm font-black text-slate-800">₹{capitalEmployed.toLocaleString()} L</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Multi-Year Comparison Table */}
        <Card className="lg:col-span-3" title="Historical Performance Benchmarks">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-400 uppercase font-black border-b border-slate-100">
                  <th className="pb-4 text-left whitespace-nowrap">Period</th>
                  <th className="pb-4 text-right whitespace-nowrap px-2">Revenue (₹L)</th>
                  <th className="pb-4 text-right whitespace-nowrap px-2">Exp. (₹L)</th>
                  <th className="pb-4 text-right whitespace-nowrap px-2">Profit (₹L)</th>
                  <th className="pb-4 text-right whitespace-nowrap px-2">Assets (₹L)</th>
                  <th className="pb-4 text-right whitespace-nowrap px-2">Liabilities (₹L)</th>
                  <th className="pb-4 text-right whitespace-nowrap px-2">Rev Growth</th>
                  <th className="pb-4 text-right whitespace-nowrap px-2">Profit Growth</th>
                  <th className="pb-4 text-center whitespace-nowrap px-2">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {FINANCIAL_DATA.map((d, i) => {
                  const prevYear = FINANCIAL_DATA[i + 1];
                  const revGrowth = prevYear ? ((d.revenue - prevYear.revenue) / prevYear.revenue) * 100 : 0;
                  const profitGrowth = prevYear ? ((d.profit - prevYear.profit) / Math.abs(prevYear.profit)) * 100 : 0;

                  return (
                    <tr key={d.year} className={`group hover:bg-slate-50/80 transition-all ${d.year === selectedYear ? 'bg-orange-50/40 ring-1 ring-inset ring-orange-100' : ''}`}>
                      <td className="py-4 font-black text-slate-800 whitespace-nowrap">FY {d.year}</td>
                      <td className="py-4 text-right font-bold text-slate-600 px-2">₹{d.revenue.toLocaleString()}</td>
                      <td className="py-4 text-right font-medium text-slate-500 px-2">₹{d.expenses.toLocaleString()}</td>
                      <td className={`py-4 text-right font-black px-2 ${d.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        ₹{d.profit.toLocaleString()}
                      </td>
                      <td className="py-4 text-right font-medium text-slate-600 px-2">₹{d.assets.toLocaleString()}</td>
                      <td className="py-4 text-right font-medium text-slate-600 px-2">₹{d.liabilities.toLocaleString()}</td>
                      <td className="py-4 text-right px-2">
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black ${revGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {revGrowth >= 0 ? '+' : ''}{revGrowth.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 text-right px-2">
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black ${profitGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {profitGrowth >= 0 ? '+' : ''}{profitGrowth.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 text-center px-2">
                        <button
                          onClick={() => downloadBalanceSheet(d.year)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                          title="Download Report"
                        >
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Historical Balance Sheets Archive */}
      <Card title="Regulatory & Filing Documents">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {FINANCIAL_DATA.map((d) => (
            <button
              key={d.year}
              onClick={() => downloadBalanceSheet(d.year)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                <FileText size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-800">FY {d.year}</span>
              <span className="text-[9px] font-bold text-orange-500 uppercase">Balance Sheet</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Corporate Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Entity Information">
          <div className="grid grid-cols-2 gap-6 py-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Corporate Name</p>
              <p className="font-black text-slate-800 leading-tight">{CORPORATE_INFO.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Company Status</p>
              <p className="font-black text-slate-800">Private Limited</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Reg. Office</p>
              <p className="font-black text-slate-800">{CORPORATE_INFO.location}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Industry Sector</p>
              <p className="font-black text-orange-600">{CORPORATE_INFO.sector}</p>
            </div>
          </div>
        </Card>

        <Card title="Board of Directors">
          <div className="space-y-3 py-1">
            {DIRECTORS.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-sm">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-black text-slate-800 block leading-none">{d.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 inline-block">Director</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">DIN</span>
                  <span className="text-xs font-bold text-slate-700">{d.din}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
