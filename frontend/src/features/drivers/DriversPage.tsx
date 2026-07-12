import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { driverService } from './driver.service';

export const DriversPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: drivers, isLoading, error } = useQuery({
    queryKey: ['drivers', search, statusFilter],
    queryFn: () => driverService.list(),
  });

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];

    return drivers.filter((driver) => {
      const searchText = `${driver.name} ${driver.email} ${driver.licenseNumber} ${driver.licenseCategory}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus = statusFilter ? driver.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  const isLicenseExpired = (expiryDateStr: string) => {
    return new Date(expiryDateStr) < new Date();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Registry"
        description="Verify driver status, dispatch safety eligibility, and route completion statistics."
      />

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
        <Input
          label="Search Drivers"
          placeholder="Name, email, license..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md w-full"
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'ALL STATUSES' },
            { value: 'AVAILABLE', label: 'AVAILABLE' },
            { value: 'ON_TRIP', label: 'ON_TRIP' },
            { value: 'OFF_DUTY', label: 'OFF_DUTY' },
            { value: 'SUSPENDED', label: 'SUSPENDED' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-xs font-mono">Loading drivers...</div>
      ) : error ? (
        <div className="text-red-600 text-xs font-mono">Failed to load drivers.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono uppercase tracking-wider text-xxs">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">License Number</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3">Safety Score</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Completion</th>
                <th className="px-6 py-3">Dispatch Eligible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    No drivers found in registry.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const expired = isLicenseExpired(driver.licenseExpiryDate);
                  return (
                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{driver.name}</td>
                      <td className="px-6 py-3.5">{driver.email}</td>
                      <td className="px-6 py-3.5 font-mono">{driver.licenseNumber}</td>
                      <td className="px-6 py-3.5">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xxs font-mono uppercase">
                            Expired (Blocked)
                          </span>
                        ) : (
                          <span className="font-mono">{new Date(driver.licenseExpiryDate).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{driver.safetyScore.toFixed(1)}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={driver.status} />
                      </td>
                      <td className="px-6 py-3.5 font-mono">{driver.completionRate}%</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xxs font-mono uppercase font-semibold border ${driver.dispatchEligible && !expired ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {driver.dispatchEligible && !expired ? 'Eligible' : 'Blocked'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
