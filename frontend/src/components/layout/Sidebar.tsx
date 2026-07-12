import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  DollarSign,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  user,
  onLogout,
  onClose,
}) => {
  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', to: '/vehicles', icon: Truck },
    { name: 'Drivers', to: '/drivers', icon: Users },
    { name: 'Trips', to: '/trips', icon: MapPin },
    { name: 'Maintenance', to: '/maintenance', icon: Wrench },
    { name: 'Fuel & Expenses', to: '/finance', icon: DollarSign },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  ];

  return (
    <div
      className={`bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 h-full ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <span className="text-xl font-bold tracking-wider text-white uppercase font-mono">
              Transit<span className="text-brand-500">Ops</span>
            </span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-brand-500 mx-auto">TO</span>
          )}
          <div className="flex items-center gap-1.5">
            {setCollapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 hidden md:block"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white border-l-4 border-brand-500 rounded-l-none'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session Info / Logout */}
      <div className="border-t border-slate-800 p-4">
        {!collapsed && user && (
          <div className="mb-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
            <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
            <p className="text-xs text-brand-400 font-medium truncate mt-0.5">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Log Out' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Log Out</span>}
        </button>
      </div>
    </div>
  );
};
