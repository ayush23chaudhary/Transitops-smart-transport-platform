import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const DriversPage: React.FC = () => {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get<any[]>('/drivers'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Management (Drivers)"
        description="Extension point for Developer 3 (Workforce)"
      />

      <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-xl text-sm">
        <h4 className="font-semibold mb-1">Developer 3 Scope (Workforce)</h4>
        <p>This module contains Driver rosters, safety scores, and auth roles. The backend integration routes are mounted at <code>GET /api/drivers</code>.</p>
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm">Loading drivers...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">License Number</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3">Safety Score</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {drivers?.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{driver.name}</td>
                  <td className="px-6 py-4">{driver.email}</td>
                  <td className="px-6 py-4 font-mono">{driver.licenseNumber}</td>
                  <td className="px-6 py-4">{new Date(driver.licenseExpiryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{driver.safetyScore}/10.0</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={driver.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
