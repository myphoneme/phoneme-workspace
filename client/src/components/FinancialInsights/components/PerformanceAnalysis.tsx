import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card } from './Card';
import { FINANCIAL_DATA } from '../constants';

export const PerformanceAnalysis: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Operational Performance (Revenue & Expenses)">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...FINANCIAL_DATA].reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="revenue" name="Revenue (₹L)" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses (₹L)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Earnings Per Share (EPS)">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...FINANCIAL_DATA].reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="stepAfter" dataKey="eps" name="EPS Value" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
    <Card title="Margin Analysis & Operational Ratios">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FINANCIAL_DATA.slice(0, 3).map((f) => (
          <div key={f.year} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-800 mb-4 border-b pb-2 flex items-center justify-between">
              <span>FY {f.year}</span>
              <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">Verified</span>
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Net Profit Margin</span>
                <span className="font-black text-emerald-600">{((f.profit / f.revenue) * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Operating Ratio</span>
                <span className="font-black text-slate-800">{((f.expenses / f.revenue) * 100).toFixed(2)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(f.profit / f.revenue) * 100}%` }} />
                <div className="bg-slate-300 h-full" style={{ width: `${(f.expenses / f.revenue) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);
