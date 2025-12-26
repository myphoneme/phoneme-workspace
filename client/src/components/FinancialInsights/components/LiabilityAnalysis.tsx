import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Card } from './Card';
import { FINANCIAL_DATA } from '../constants';

export const LiabilityAnalysis: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Equity Structure vs Total Liabilities">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...FINANCIAL_DATA].reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" dataKey="equity" name="Net Equity" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} strokeWidth={3} />
              <Area type="monotone" dataKey="liabilities" name="Liabilities" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Solvency Trend (Debt-to-Equity)">
        <p className="text-xs font-bold text-slate-400 uppercase mb-8 tracking-widest">Leverage Health Indicator</p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...FINANCIAL_DATA].reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="debtEquityRatio" name="D/E Ratio" stroke="#ef4444" strokeWidth={4} dot={{ r: 7, fill: '#fff', stroke: '#ef4444', strokeWidth: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-400 mt-6 italic text-center font-medium uppercase tracking-widest">Target Threshold: {'<'} 1.0 (Ideal)</p>
      </Card>
    </div>
  </div>
);
