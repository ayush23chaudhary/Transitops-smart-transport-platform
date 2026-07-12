import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { KPICard } from '../../components/ui/KPICard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/api';
import { 
  Users, 
  Navigation, 
  Wrench, 
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: trips, isLoading: isTripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get<any[]>('/trips'),
  });

  const { data: vehicles, isLoading: isVehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<any[]>('/vehicles'),
  });

  const { data: drivers, isLoading: isDriversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get<any[]>('/drivers'),
  });

  const isLoading = isTripsLoading || isVehiclesLoading || isDriversLoading;

  // Calculation logic based on real data
  const totalVehicles = vehicles?.length ?? 0;
  const activeVehicles = vehicles?.filter(v => v.status === 'ON_TRIP').length ?? 0;
  const availableVehicles = vehicles?.filter(v => v.status === 'AVAILABLE').length ?? 0;
  const inMaintenanceVehicles = vehicles?.filter(v => v.status === 'IN_SHOP').length ?? 0;
  const retiredVehicles = vehicles?.filter(v => v.status === 'RETIRED').length ?? 0;
  
  const activeNonRetiredVehicles = totalVehicles - retiredVehicles;
  const utilizationRate = activeNonRetiredVehicles > 0 
    ? Math.round((activeVehicles / activeNonRetiredVehicles) * 100) 
    : 0;

  const activeTrips = trips?.filter(t => t.status === 'DISPATCHED').length ?? 0;
  const draftTrips = trips?.filter(t => t.status === 'DRAFT').length ?? 0;
  const completedTrips = trips?.filter(t => t.status === 'COMPLETED').length ?? 0;

  const driversOnDuty = drivers?.filter(d => d.status === 'AVAILABLE' || d.status === 'ON_TRIP').length ?? 0;

  const recentTrips = trips
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) ?? [];

  if (isLoading) {
    return <LoadingState message="Aggregating operations metrics..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Operations Dashboard"
        description="Real-time terminal logistics, fleet distribution, and driver assignments."
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Fleet Utilization"
          value={`${utilizationRate}%`}
          icon={TrendingUp}
          description={`${activeVehicles} of ${activeNonRetiredVehicles} active trucks en route`}
          loading={isLoading}
        />
        <KPICard
          title="Drivers On Duty"
          value={driversOnDuty}
          icon={Users}
          description="Available or currently on trips"
          loading={isLoading}
        />
        <KPICard
          title="Active Dispatches"
          value={activeTrips}
          icon={Navigation}
          description="Cargo loads currently in transit"
          loading={isLoading}
        />
        <KPICard
          title="Vehicles In Shop"
          value={inMaintenanceVehicles}
          icon={Wrench}
          description="Undergoing scheduled repairs"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Trips & Operations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Dispatches</h3>
                <p className="text-xs text-slate-500">Latest scheduled or active dispatches</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                {trips?.length ?? 0} Total Trips
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="px-6 py-3.5">Trip Ref</th>
                    <th className="px-6 py-3.5">Route</th>
                    <th className="px-6 py-3.5">Assigned Resource</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentTrips.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                        No recent trips scheduled.
                      </td>
                    </tr>
                  ) : (
                    recentTrips.map((trip: any) => (
                      <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-slate-950">{trip.tripNumber}</div>
                          <div className="text-xxs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(trip.scheduledAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {trip.source} → {trip.destination}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Distance: {trip.plannedDistance} km | Weight: {trip.cargoWeight} kg
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-800">{trip.vehicle?.name}</div>
                          <div className="text-xxs text-slate-500 font-mono mt-0.5">{trip.vehicle?.registrationNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={trip.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Status Breakdown */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Fleet Distribution</h3>
            <p className="text-xs text-slate-500 mb-6">Status breakdown of registered active trucks</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                    On Trip (Active)
                  </span>
                  <span>{activeVehicles} / {activeNonRetiredVehicles}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeNonRetiredVehicles > 0 ? (activeVehicles / activeNonRetiredVehicles) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Available (Idle)
                  </span>
                  <span>{availableVehicles} / {activeNonRetiredVehicles}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeNonRetiredVehicles > 0 ? (availableVehicles / activeNonRetiredVehicles) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    In Shop (Maintenance)
                  </span>
                  <span>{inMaintenanceVehicles} / {activeNonRetiredVehicles}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeNonRetiredVehicles > 0 ? (inMaintenanceVehicles / activeNonRetiredVehicles) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-slate-900">{availableVehicles}</div>
                <div className="text-xxs text-slate-500 uppercase tracking-wider font-semibold">Available</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{draftTrips}</div>
                <div className="text-xxs text-slate-500 uppercase tracking-wider font-semibold">Drafts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{completedTrips}</div>
                <div className="text-xxs text-slate-500 uppercase tracking-wider font-semibold">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
