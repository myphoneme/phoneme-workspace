import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import { Card } from './Card';
import { FINANCIAL_DATA } from '../constants';

export const RegulatoryCompliance: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card title="Statutory Framework">
      <div className="space-y-4 mt-2">
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
          <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Company Category</p>
          <p className="font-black text-slate-800">Small and Medium Sized Company (SMC)</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
          <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Audit Governance</p>
          <p className="font-black text-slate-800">Independent Statutory Audit conducted under ICAI standards</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-green-50/30 hover:bg-white hover:shadow-md transition-all">
          <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Reporting Health</p>
          <p className="font-black text-green-700 flex items-center gap-2">
            <ShieldCheck size={18} /> Verified on Going Concern Basis
          </p>
        </div>
      </div>
    </Card>
    <Card title="Short-term Liquidity (Current Ratio)">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...FINANCIAL_DATA].reverse()}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} />
            <YAxis domain={[0, 2]} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="currentRatio" name="Current Ratio" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
              {FINANCIAL_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.currentRatio >= 1.2 ? '#10b981' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 flex justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Healthy ({'>'}1.2)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm" /> Monitor</div>
      </div>
    </Card>
  </div>
);
