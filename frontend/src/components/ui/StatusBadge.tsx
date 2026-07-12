import React from 'react';

type StatusType =
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'IN_SHOP'
  | 'RETIRED'
  | 'OFF_DUTY'
  | 'SUSPENDED'
  | 'DRAFT'
  | 'DISPATCHED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SCHEDULED'
  | 'IN_PROGRESS';

interface StatusBadgeProps {
  status: StatusType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase() as StatusType;

  const config: Record<StatusType, { bg: string; text: string; label: string }> = {
    AVAILABLE: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Available' },
    ON_TRIP: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', label: 'On Trip' },
    IN_SHOP: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'In Shop' },
    RETIRED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Retired' },
    OFF_DUTY: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'Off Duty' },
    SUSPENDED: { bg: 'bg-red-100 border-red-200', text: 'text-red-800', label: 'Suspended' },
    DRAFT: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'Draft' },
    DISPATCHED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Dispatched' },
    COMPLETED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Completed' },
    CANCELLED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Cancelled' },
    SCHEDULED: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', label: 'Scheduled' },
    IN_PROGRESS: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'In Progress' },
  };

  const dotColor: Record<StatusType, string> = {
    AVAILABLE: 'bg-emerald-500',
    ON_TRIP: 'bg-sky-500',
    IN_SHOP: 'bg-amber-500',
    RETIRED: 'bg-red-500',
    OFF_DUTY: 'bg-slate-400',
    SUSPENDED: 'bg-red-600',
    DRAFT: 'bg-slate-400',
    DISPATCHED: 'bg-blue-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-red-500',
    SCHEDULED: 'bg-indigo-500',
    IN_PROGRESS: 'bg-amber-500',
  };

  const current = config[normalized] || {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-700',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${current.bg} ${current.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[normalized] || 'bg-slate-400'}`} />
      {current.label}
    </span>
  );
};
