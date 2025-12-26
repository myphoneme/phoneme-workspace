import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className, headerAction }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 ${className}`}>
    {(title || headerAction) && (
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
        {headerAction}
      </div>
    )}
    {children}
  </div>
);

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color, subValue }) => (
  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: color.split(' ')[1]?.replace('text-', '') || '#3b82f6' }}>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);
