import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide';

    const variants = {
      primary:   'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-200',
      danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
      outline:   'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100',
      ghost:     'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xxs',
      md: 'px-3.5 py-2 text-xs',
      lg: 'px-5 py-2.5 text-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <>
            {/* 3-dot pulsing loader instead of spinner */}
            <span className="flex items-center gap-1 mr-2">
              {[0, 0.15, 0.3].map((delay, i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-current"
                  style={{
                    animation: `dot-pulse 0.8s ease-in-out ${delay}s infinite alternate`,
                  }}
                />
              ))}
            </span>
            <style>{`
              @keyframes dot-pulse {
                from { opacity: 0.2; transform: scale(0.8); }
                to   { opacity: 1;   transform: scale(1.2); }
              }
            `}</style>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
