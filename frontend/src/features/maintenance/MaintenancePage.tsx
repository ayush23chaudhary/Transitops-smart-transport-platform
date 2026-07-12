import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const MaintenancePage: React.FC = () => {
  const { data: records, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => api.get<any[]>('/maintenance'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Maintenance Logs"
        description="Extension point for Developer 2 (Fleet)"
      />

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm">
        <h4 className="font-semibold mb-1">Developer 2 Scope (Maintenance)</h4>
        <p>This module contains maintenance logs. The backend integration routes are mounted at <code>GET /api/maintenance</code>.</p>
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm">Loading logs...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Cost</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records?.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{record.vehicle?.registrationNumber}</td>
                  <td className="px-6 py-4 font-medium">{record.maintenanceType}</td>
                  <td className="px-6 py-4 text-slate-500">{record.description}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">${record.cost}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
              {records?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-400">No maintenance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
