import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-3 bg-slate-200 rounded w-20" />
          <div className="h-7 bg-slate-200 rounded w-7" />
        </div>
        <div className="h-8 bg-slate-200 rounded w-14 mb-2" />
        <div className="h-2.5 bg-slate-200 rounded w-28" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 group hover:border-slate-300 transition-colors relative overflow-hidden">
      {/* Top-right icon */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-xxs font-mono uppercase tracking-widest text-slate-400 font-semibold">
          {title}
        </span>
        <div className="p-1.5 bg-slate-50 border border-slate-100 rounded text-slate-500">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums leading-none mb-2">
        {value}
      </div>

      {/* Description / Trend */}
      {(description || trend) && (
        <div className="flex items-center gap-2 text-xxs mt-2">
          {trend && (
            <span
              className={`font-mono font-bold ${
                trend.isPositive ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {description && (
            <span className="text-slate-400 font-mono uppercase tracking-wider">
              {description}
            </span>
          )}
        </div>
      )}

      {/* Bottom accent line — a thin brand-color underline that appears on hover */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-500 group-hover:w-full transition-all duration-500" />
    </div>
  );
};
