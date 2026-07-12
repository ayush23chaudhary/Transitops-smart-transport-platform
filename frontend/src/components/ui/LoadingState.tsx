import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {/* Operational-style loading bars instead of a generic spinner */}
      <div className="flex items-end gap-1 h-8">
        {[0.4, 0.7, 1, 0.7, 0.4].map((delay, i) => (
          <div
            key={i}
            className="w-1 bg-brand-500 rounded-full"
            style={{
              height: `${(i % 3 === 1 ? 32 : i % 3 === 0 ? 18 : 24)}px`,
              animation: `equalize 0.9s ease-in-out ${delay * 0.3}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <span className="text-xxs text-slate-400 font-mono uppercase tracking-widest">
        {message}
      </span>
      <style>{`
        @keyframes equalize {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to   { transform: scaleY(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};
