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
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded-full w-8"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">{title}</span>
          <h4 className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">{value}</h4>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-3 flex items-center space-x-2 text-xs">
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.value}
            </span>
          )}
          {description && <span className="text-slate-500 font-medium">{description}</span>}
        </div>
      )}
    </div>
  );
};
