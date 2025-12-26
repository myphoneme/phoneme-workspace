import React from 'react';
import { Download } from 'lucide-react';
import { Card } from './Card';
import { FINANCIAL_DATA } from '../constants';

export const RawDataTable: React.FC = () => {
  const handleExport = () => {
    const headers = "Year,Revenue,Expenses,Profit,Assets,Liabilities,Equity,CurrentRatio,DebtEquityRatio,EPS\n";
    const rows = FINANCIAL_DATA.map(d =>
      `${d.year},${d.revenue},${d.expenses},${d.profit},${d.assets},${d.liabilities},${d.equity},${d.currentRatio},${d.debtEquityRatio},${d.eps}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Phoneme_Financials_Full_Data.csv`;
    a.click();
  };

  return (
    <Card headerAction={
      <button onClick={handleExport} className="text-xs font-black text-orange-600 hover:underline flex items-center gap-1">
        <Download size={14} /> EXPORT TABLE
      </button>
    }>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400">
              <th className="p-4">Period</th>
              <th className="p-4">Revenue (₹L)</th>
              <th className="p-4">Profit (₹L)</th>
              <th className="p-4">Total Assets (₹L)</th>
              <th className="p-4">Liabilities (₹L)</th>
              <th className="p-4">Liq. Ratio</th>
              <th className="p-4">EPS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {FINANCIAL_DATA.map((row) => (
              <tr key={row.year} className="group hover:bg-slate-50 transition-colors">
                <td className="p-4 font-black text-slate-900">FY {row.year}</td>
                <td className="p-4 font-bold text-slate-600">{row.revenue.toLocaleString()}</td>
                <td className={`p-4 font-black ${row.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {row.profit.toLocaleString()}
                </td>
                <td className="p-4 font-medium text-slate-600">{row.assets.toLocaleString()}</td>
                <td className="p-4 font-medium text-slate-600">{row.liabilities.toLocaleString()}</td>
                <td className="p-4 font-black text-orange-600">{row.currentRatio}</td>
                <td className="p-4 font-bold text-slate-700">{row.eps.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
