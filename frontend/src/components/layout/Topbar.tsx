import React from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';

interface TopbarProps {
  user: { name: string; email: string; role: string } | null;
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMobileMenuToggle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-mono uppercase tracking-wider hidden md:inline-block">
            TERMINAL-01 DEPOT
          </span>
        </div>

      <div className="flex items-center space-x-4">
        {/* Mock Notifications */}
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>
 
        {/* User Info */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
            <UserIcon className="h-4 w-4" />
          </div>
          {user && (
            <div className="hidden sm:block">
              <span className="block text-sm font-semibold text-slate-800 leading-tight">
                {user.name}
              </span>
              <span className="block text-xxs font-mono bg-brand-50 border border-brand-200 text-brand-700 px-1.5 py-0.5 rounded uppercase mt-0.5 tracking-wider inline-block">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
