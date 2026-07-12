import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const VehiclesPage: React.FC = () => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<any[]>('/vehicles'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Management (Vehicles)"
        description="Extension point for Developer 2 (Fleet)"
      />

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm">
        <h4 className="font-semibold mb-1">Developer 2 Scope (Fleet)</h4>
        <p>This module contains the Vehicle entities and Fleet metrics. The backend integration routes are mounted at <code>GET /api/vehicles</code>.</p>
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm">Loading vehicles...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="px-6 py-3">Registration</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">Odometer</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {vehicles?.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{vehicle.registrationNumber}</td>
                  <td className="px-6 py-4">{vehicle.name}</td>
                  <td className="px-6 py-4">{vehicle.type}</td>
                  <td className="px-6 py-4">{vehicle.maxLoadCapacity} kg</td>
                  <td className="px-6 py-4">{vehicle.odometer} km</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={vehicle.status} />
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
