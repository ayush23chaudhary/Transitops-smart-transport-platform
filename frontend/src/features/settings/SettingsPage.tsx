import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Shield, User as UserIcon, Check, X, AlertCircle } from 'lucide-react';

type TabType = 'GENERAL' | 'ROLES' | 'ACCOUNT';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('GENERAL');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user.role === 'FLEET_MANAGER';

  // Form State
  const [formData, setFormData] = useState({
    depotName: '',
    currencyCode: '',
    distanceUnit: '',
  });

  // Query Settings
  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any }>('/settings');
      // Update local state once data is loaded
      if (response?.data) {
        setFormData({
          depotName: response.data.depotName || '',
          currencyCode: response.data.currencyCode || '',
          distanceUnit: response.data.distanceUnit || '',
        });
      }
      return response?.data;
    },
  });

  // Mutation Settings
  const updateMutation = useMutation({
    mutationFn: (body: typeof formData) => api.patch('/settings', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Depot settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    updateMutation.mutate(formData);
  };

  // RBAC Visual definitions derived strictly from backend routes & RBAC_MATRIX.md
  const rbacMatrix = [
    {
      module: 'Dashboard',
      description: 'Real-time overview, utilization, & dispatches log',
      permissions: {
        FLEET_MANAGER: 'VIEW',
        DISPATCHER: 'VIEW',
        SAFETY_OFFICER: 'VIEW',
        FINANCIAL_ANALYST: 'VIEW',
      },
    },
    {
      module: 'Vehicles Registry',
      description: 'Create, read, & modify unit assets logs',
      permissions: {
        FLEET_MANAGER: 'MANAGE',
        DISPATCHER: 'VIEW',
        SAFETY_OFFICER: 'VIEW',
        FINANCIAL_ANALYST: 'VIEW',
      },
    },
    {
      module: 'Drivers Management',
      description: 'Manage personnel registry, scores, and safety criteria',
      permissions: {
        FLEET_MANAGER: 'VIEW',
        DISPATCHER: 'VIEW',
        SAFETY_OFFICER: 'MANAGE',
        FINANCIAL_ANALYST: 'NO ACCESS',
      },
    },
    {
      module: 'Trip Dispatcher',
      description: 'Schedule, dispatch, complete, & cancel delivery dispatches',
      permissions: {
        FLEET_MANAGER: 'MANAGE',
        DISPATCHER: 'MANAGE',
        SAFETY_OFFICER: 'VIEW',
        FINANCIAL_ANALYST: 'NO ACCESS',
      },
    },
    {
      module: 'Maintenance Logs',
      description: 'Schedule workshop jobs and start/stop repairs',
      permissions: {
        FLEET_MANAGER: 'MANAGE',
        DISPATCHER: 'VIEW',
        SAFETY_OFFICER: 'NO ACCESS',
        FINANCIAL_ANALYST: 'VIEW',
      },
    },
    {
      module: 'Fuel & Expenses Log',
      description: 'Audit expense ledgers and log unit operational costs',
      permissions: {
        FLEET_MANAGER: 'VIEW',
        DISPATCHER: 'NO ACCESS',
        SAFETY_OFFICER: 'NO ACCESS',
        FINANCIAL_ANALYST: 'MANAGE',
      },
    },
    {
      module: 'Analytics Center',
      description: 'Examine unit ROI margins and aggregate fleet analytics',
      permissions: {
        FLEET_MANAGER: 'VIEW',
        DISPATCHER: 'VIEW',
        SAFETY_OFFICER: 'VIEW',
        FINANCIAL_ANALYST: 'VIEW',
      },
    },
    {
      module: 'Depot Configuration',
      description: 'Edit terminal parameters and default distance/units logs',
      permissions: {
        FLEET_MANAGER: 'MANAGE',
        DISPATCHER: 'VIEW',
        SAFETY_OFFICER: 'VIEW',
        FINANCIAL_ANALYST: 'VIEW',
      },
    },
  ];

  const getPermissionBadge = (level: string) => {
    switch (level) {
      case 'MANAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xxs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono">
            <Check className="h-3 w-3" /> MANAGE
          </span>
        );
      case 'VIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xxs font-semibold bg-slate-50 border border-slate-200 text-slate-600 font-mono">
            <Check className="h-3 w-3 text-slate-400" /> VIEW ONLY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xxs font-semibold bg-red-50 border border-red-100 text-red-600 font-mono">
            <X className="h-3 w-3" /> NO ACCESS
          </span>
        );
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'FLEET_MANAGER':
        return 'Full administrative access over vehicle registry life cycles, depot parameters, and maintenance assignments.';
      case 'DISPATCHER':
        return 'Day-to-day workflow management: planning routes, assigning vehicles & drivers, and recording completions.';
      case 'SAFETY_OFFICER':
        return 'Driver registry profiles oversight, scoring metrics compliance, and safety criteria enforcement.';
      case 'FINANCIAL_ANALYST':
        return 'Expense parameters oversight, recording fuel transaction logs, and reviewing fleet analytics ROI dashboards.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Console Settings"
        description="Configure depot parameters and inspect role-based console permissions."
      />

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 gap-1">
        {(['GENERAL', 'ROLES', 'ACCOUNT'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'GENERAL' && 'General Settings'}
            {tab === 'ROLES' && 'Roles & Permissions'}
            {tab === 'ACCOUNT' && 'User Account'}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'GENERAL' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm max-w-2xl space-y-4">
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded">
            <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-700 tracking-wider">Depot Authorization Policy</h4>
              <p className="text-xxs text-slate-500 font-mono leading-relaxed">
                General configurations affect all platform logs and distance tracking. Only the FLEET MANAGER holds permissions to change these variables. Access is read-only for other operational roles.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center font-mono text-xs text-slate-500">Retrieving depot settings...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <Input
                label="Depot Name"
                value={formData.depotName}
                onChange={(e) => setFormData({ ...formData, depotName: e.target.value })}
                disabled={!isManager}
                required
                placeholder="e.g. Gandhinagar Depot GT4"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Currency Code
                  </label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                    disabled={!isManager}
                    className="w-full text-xs font-mono border border-slate-300 rounded p-2 bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Distance Unit
                  </label>
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) => setFormData({ ...formData, distanceUnit: e.target.value })}
                    disabled={!isManager}
                    className="w-full text-xs font-mono border border-slate-300 rounded p-2 bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                  </select>
                </div>
              </div>

              {isManager && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={updateMutation.isPending}
                    className="font-mono text-xs uppercase tracking-wider font-semibold"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {activeTab === 'ROLES' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-600" />
              <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider">Operational Access Matrix</h3>
            </div>
            <p className="text-xxs text-slate-500 font-mono leading-relaxed">
              Access is determined by assigned operational roles. Permissions shown here reflect the current authorization policy enforced by TransitOps backend middlewares.
            </p>
          </div>

          {/* Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xxs font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3 w-60">Module / Resource</th>
                    <th className="px-5 py-3">Fleet Manager</th>
                    <th className="px-5 py-3">Dispatcher</th>
                    <th className="px-5 py-3">Safety Officer</th>
                    <th className="px-5 py-3">Financial Analyst</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rbacMatrix.map((row) => (
                    <tr key={row.module} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 uppercase tracking-wide">{row.module}</div>
                        <div className="text-slate-400 font-medium mt-0.5 normal-case">{row.description}</div>
                      </td>
                      <td className="px-5 py-4">{getPermissionBadge(row.permissions.FLEET_MANAGER)}</td>
                      <td className="px-5 py-4">{getPermissionBadge(row.permissions.DISPATCHER)}</td>
                      <td className="px-5 py-4">{getPermissionBadge(row.permissions.SAFETY_OFFICER)}</td>
                      <td className="px-5 py-4">{getPermissionBadge(row.permissions.FINANCIAL_ANALYST)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] as const).map((role) => (
              <div key={role} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
                <span className="text-xxs font-mono bg-slate-900 border border-slate-800 text-slate-200 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                  {role.replace(/_/g, ' ')}
                </span>
                <p className="text-xxs text-slate-500 font-mono leading-relaxed mt-2">
                  {getRoleDescription(role)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ACCOUNT' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm max-w-md space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-white">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">{user.name}</h3>
              <span className="text-xxs font-mono bg-brand-50 border border-brand-200 text-brand-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3 font-mono text-xxs">
            <div className="flex justify-between">
              <span className="text-slate-400 uppercase">Email Address:</span>
              <span className="text-slate-800 font-bold">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 uppercase">User Identifier:</span>
              <span className="text-slate-500">{user.id || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
