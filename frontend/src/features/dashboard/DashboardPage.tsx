import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { KPICard } from '../../components/ui/KPICard';
import { api } from '../../lib/api';
import { Truck, Users, Navigation, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => api.get<any>('/analytics/summary'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Overview"
        description="Real-time operational status and fleet metrics"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Vehicles"
          value={summary?.vehicles ?? 0}
          icon={Truck}
          description="Active registered in fleet"
          loading={isLoading}
        />
        <KPICard
          title="Active Drivers"
          value={summary?.drivers ?? 0}
          icon={Users}
          description="On-duty and available"
          loading={isLoading}
        />
        <KPICard
          title="Active Dispatches"
          value={summary?.activeTrips ?? 0}
          icon={Navigation}
          description="Trips currently en-route"
          loading={isLoading}
        />
        <KPICard
          title="Trips in Draft"
          value={summary?.pendingTrips ?? 0}
          icon={Clock}
          description="Awaiting scheduling & dispatch"
          loading={isLoading}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Platform Console Ready</h3>
        <p className="text-slate-500 text-sm">
          Navigate to the <strong className="text-slate-700 font-semibold">Trips</strong> view to manage cargo dispatching, or inspect the skeleton pages for Fleet, Workforce, and Intelligence.
        </p>
      </div>
    </div>
  );
};
