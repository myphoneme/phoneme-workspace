import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Card } from './Card';
import { FINANCIAL_DATA } from '../constants';

export const AssetAnalysis: React.FC = () => {
  const pieData = [
    { name: 'Fixed Assets', value: 88.7 + 69.2 },
    { name: 'Current Investments', value: 114.2 },
    { name: 'Trade Receivables', value: 59.4 },
    { name: 'Cash & Equiv', value: 67.3 },
    { name: 'Other Assets', value: 74.6 }
  ];
  const COLORS = ['#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2" title="Asset Base Expansion (INR Lakhs)">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...FINANCIAL_DATA].reverse()}>
              <defs>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="assets" name="Total Assets" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAssets)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Portfolio Mix (FY 2025)">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-y-3">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-[11px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: COLORS[index] }} />
                <span className="text-slate-500 uppercase tracking-tighter">{entry.name}</span>
              </div>
              <span className="font-black text-slate-800">₹{entry.value.toFixed(1)} L</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
