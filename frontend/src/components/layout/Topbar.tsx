import React, { useState, useEffect } from 'react';
import { Menu, Bell, User as UserIcon, Radio } from 'lucide-react';

interface TopbarProps {
  user: { name: string; email: string; role: string } | null;
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMobileMenuToggle }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(time.getHours());
  const mm = pad(time.getMinutes());
  const ss = pad(time.getSeconds());
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 relative scanline-overlay">
      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 -ml-2 rounded text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Live System Clock */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 text-emerald-400 px-3 py-1.5 rounded border border-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 status-dot-live inline-block" />
            <span className="font-mono text-sm font-semibold tracking-widest">
              {hh}:{mm}:{ss}
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-xxs text-slate-400 uppercase tracking-wider">{dateStr}</span>
            <span className="font-mono text-xxs text-slate-500 uppercase tracking-wider">TERMINAL-01 · DEPOT-A</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 relative z-10">
        {/* System live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xxs font-mono text-slate-400 border border-slate-200 px-2 py-1 rounded bg-slate-50">
          <Radio className="h-3 w-3 text-emerald-500" />
          <span className="uppercase tracking-wider">LIVE</span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded text-slate-500 hover:bg-slate-100 relative">
          <Bell className="h-4.5 w-4.5 h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 ring-1 ring-white" />
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
          <div className="h-8 w-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold text-xs font-mono">
            {user?.name?.charAt(0)?.toUpperCase() ?? <UserIcon className="h-4 w-4" />}
          </div>
          {user && (
            <div className="hidden sm:block">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {user.name}
              </span>
              <span className="block text-xxs font-mono bg-slate-900 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase mt-0.5 tracking-wider inline-block">
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
