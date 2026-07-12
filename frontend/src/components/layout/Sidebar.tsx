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

const operationsNav = [
  { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, live: true },
  { name: 'Vehicles', to: '/vehicles', icon: Truck },
  { name: 'Drivers', to: '/drivers', icon: Users },
  { name: 'Trips', to: '/trips', icon: MapPin },
  { name: 'Maintenance', to: '/maintenance', icon: Wrench },
];

const reportingNav = [
  { name: 'Fuel & Expenses', to: '/finance', icon: DollarSign },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  user,
  onLogout,
  onClose,
}) => {
  const navItemClass = (isActive: boolean, collapsed: boolean) =>
    `group flex items-center px-3 py-2 rounded text-xs font-medium transition-all duration-150 ${
      isActive
        ? 'bg-slate-800 text-white border-l-2 border-brand-500 rounded-l-none pl-[10px]'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
    } ${collapsed ? 'justify-center' : ''}`;

  return (
    <div
      className={`bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 h-full ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-widest text-white uppercase font-mono">
                Transit<span className="text-brand-500">Ops</span>
              </span>
              <span className="text-xxs text-slate-600 uppercase tracking-widest font-mono mt-0.5">
                CTRL CONSOLE
              </span>
            </div>
          )}
          {collapsed && (
            <span className="text-base font-bold text-brand-500 mx-auto font-mono">TO</span>
          )}
          <div className="flex items-center gap-1">
            {setCollapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-slate-200 hidden md:block"
              >
                {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-slate-200 md:hidden"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {/* Section: Operations */}
          {!collapsed && (
            <div className="px-2 pb-1.5 pt-1">
              <span className="text-xxs font-mono uppercase tracking-widest text-slate-600 font-semibold">
                Operations
              </span>
            </div>
          )}
          {collapsed && <div className="border-t border-slate-800 my-2 mx-2" />}

          {operationsNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => navItemClass(isActive, collapsed)}
              title={collapsed ? item.name : undefined}
            >
              <div className="relative flex-shrink-0">
                <item.icon className="h-4 w-4" />
                {item.live && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 status-dot-live" />
                )}
              </div>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          ))}

          {/* Section: Reporting */}
          {!collapsed && (
            <div className="px-2 pb-1.5 pt-4">
              <span className="text-xxs font-mono uppercase tracking-widest text-slate-600 font-semibold">
                Reporting
              </span>
            </div>
          )}
          {collapsed && <div className="border-t border-slate-800 my-2 mx-2" />}

          {reportingNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => navItemClass(isActive, collapsed)}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session / Logout */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        {!collapsed && user && (
          <div className="mb-3 bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <p className="text-xs font-semibold text-slate-200 truncate font-mono">{user.name}</p>
            <p className="text-xxs text-brand-400 font-mono font-medium truncate mt-0.5 uppercase tracking-wider">
              {user.role.replace(/_/g, ' ')}
            </p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`flex items-center w-full px-3 py-2 rounded text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/40 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Log Out' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Log Out</span>}
        </button>
      </div>
    </div>
  );
};
