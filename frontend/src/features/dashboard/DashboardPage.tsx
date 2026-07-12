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

      {/* Fleet Status Bar — real-time segmented strip */}
      {totalVehicles > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 status-dot-live" />
              <span className="text-xxs font-mono uppercase tracking-widest text-slate-500 font-semibold">Fleet Status — Live</span>
            </div>
            <span className="text-xxs font-mono text-slate-400 uppercase tracking-wider">{totalVehicles} total units</span>
          </div>

          {/* Segmented bar */}
          <div className="flex w-full h-2 rounded overflow-hidden mb-3">
            {availableVehicles > 0 && (
              <div
                className="bg-emerald-400 transition-all"
                style={{ width: `${(availableVehicles / totalVehicles) * 100}%` }}
                title={`Available: ${availableVehicles}`}
              />
            )}
            {activeVehicles > 0 && (
              <div
                className="bg-sky-400 transition-all"
                style={{ width: `${(activeVehicles / totalVehicles) * 100}%` }}
                title={`On Trip: ${activeVehicles}`}
              />
            )}
            {inMaintenanceVehicles > 0 && (
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${(inMaintenanceVehicles / totalVehicles) * 100}%` }}
                title={`In Shop: ${inMaintenanceVehicles}`}
              />
            )}
            {retiredVehicles > 0 && (
              <div
                className="bg-slate-300 transition-all"
                style={{ width: `${(retiredVehicles / totalVehicles) * 100}%` }}
                title={`Retired: ${retiredVehicles}`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-emerald-400" />
              <span className="text-xxs font-mono text-slate-500 uppercase tracking-wider">Available <strong className="text-slate-800">{availableVehicles}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-sky-400 status-dot-live" />
              <span className="text-xxs font-mono text-slate-500 uppercase tracking-wider">On Trip <strong className="text-slate-800">{activeVehicles}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber-400" />
              <span className="text-xxs font-mono text-slate-500 uppercase tracking-wider">In Shop <strong className="text-slate-800">{inMaintenanceVehicles}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-slate-300" />
              <span className="text-xxs font-mono text-slate-500 uppercase tracking-wider">Retired <strong className="text-slate-800">{retiredVehicles}</strong></span>
            </div>
          </div>
        </div>
      )}

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
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-800 font-bold">Recent Dispatches</h3>
                <p className="text-xs text-slate-500">Latest scheduled or active dispatches</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded font-mono font-medium">
                {trips?.length ?? 0} TOTAL
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold font-mono uppercase tracking-wider text-xxs">
                    <th className="px-6 py-3">Trip Ref</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Assigned Resource</th>
                    <th className="px-6 py-3">Status</th>
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
                        <td className="px-6 py-3.5">
                          <div className="font-mono font-bold text-slate-900">{trip.tripNumber}</div>
                          <div className="text-xxs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(trip.scheduledAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {trip.source} → {trip.destination}
                          </div>
                          <div className="text-xxs text-slate-500 mt-0.5">
                            Distance: <span className="font-mono">{trip.plannedDistance} km</span> | Weight: <span className="font-mono">{trip.cargoWeight} kg</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-800">{trip.vehicle?.name}</div>
                          <div className="text-xxs text-slate-500 font-mono mt-0.5">{trip.vehicle?.registrationNumber}</div>
                        </td>
                        <td className="px-6 py-3.5">
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
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-800 font-bold mb-1">Fleet Distribution</h3>
            <p className="text-xs text-slate-500 mb-6">Status breakdown of registered active trucks</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                    On Trip (Active)
                  </span>
                  <span className="font-mono">{activeVehicles} / {activeNonRetiredVehicles}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div 
                    className="bg-brand-600 h-full rounded transition-all duration-500" 
                    style={{ width: `${activeNonRetiredVehicles > 0 ? (activeVehicles / activeNonRetiredVehicles) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Available (Idle)
                  </span>
                  <span className="font-mono">{availableVehicles} / {activeNonRetiredVehicles}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded transition-all duration-500" 
                    style={{ width: `${activeNonRetiredVehicles > 0 ? (availableVehicles / activeNonRetiredVehicles) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    In Shop (Maintenance)
                  </span>
                  <span className="font-mono">{inMaintenanceVehicles} / {activeNonRetiredVehicles}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded transition-all duration-500" 
                    style={{ width: `${activeNonRetiredVehicles > 0 ? (inMaintenanceVehicles / activeNonRetiredVehicles) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-base font-bold text-slate-900 font-mono">{availableVehicles}</div>
                <div className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Available</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 font-mono">{draftTrips}</div>
                <div className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Drafts</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 font-mono">{completedTrips}</div>
                <div className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
