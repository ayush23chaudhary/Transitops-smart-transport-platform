import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
      <div className="p-4 bg-white rounded-full shadow-sm text-slate-400 mb-4 border border-slate-100">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mt-1">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
