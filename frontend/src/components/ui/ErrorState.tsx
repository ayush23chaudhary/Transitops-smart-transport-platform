import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-red-100 rounded-xl bg-red-50/50 p-6">
      <div className="p-3 bg-red-100 rounded-full text-red-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md mt-1 mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
