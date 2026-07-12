import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerActions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, title, headerActions, children, ...props }) => {
  return (
    <div
      className={twMerge(
        'bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      {(title || headerActions) && (
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
