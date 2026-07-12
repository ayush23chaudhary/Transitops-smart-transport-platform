import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { MapPin, Plus, X, Send, CheckCircle2, Ban, Eye } from 'lucide-react';

export const TripsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthorized = user.role === 'DISPATCHER' || user.role === 'FLEET_MANAGER';

  // Completion Form State
  const [actualDistance, setActualDistance] = useState<number>(0);
  const [endOdometer, setEndOdometer] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);

  // Creation Form State
  const [newTrip, setNewTrip] = useState({
    tripNumber: '',
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: 0,
    plannedDistance: 0,
    scheduledAt: '',
  });

  // Queries
  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips', statusFilter],
    queryFn: () => api.get<any[]>(`/trips${statusFilter ? `?status=${statusFilter}` : ''}`),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<any[]>('/vehicles'),
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get<any[]>('/drivers'),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/trips', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast.success('Trip draft created successfully');
      setIsCreateOpen(false);
      setNewTrip({
        tripNumber: '',
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeight: 0,
        plannedDistance: 0,
        scheduledAt: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create trip');
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/dispatch`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setSelectedTrip(data);
      toast.success('Trip successfully dispatched!');
      setIsDispatchOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to dispatch trip');
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.post(`/trips/${id}/complete`, body),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setSelectedTrip(data);
      toast.success('Trip completed successfully!');
      setIsCompleteOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete trip');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/cancel`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setSelectedTrip(data);
      toast.success('Trip cancelled successfully');
      setIsCancelOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel trip');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.vehicleId || !newTrip.driverId) {
      toast.error('Please assign a vehicle and a driver');
      return;
    }
    const selectedVehicle = vehicles?.find((v: any) => v.id === newTrip.vehicleId);
    if (selectedVehicle && Number(newTrip.cargoWeight) > Number(selectedVehicle.maxLoadCapacity)) {
      toast.error(`Vehicle capacity: ${selectedVehicle.maxLoadCapacity} kg. Cargo weight: ${newTrip.cargoWeight} kg. Capacity exceeded by ${Number(newTrip.cargoWeight) - Number(selectedVehicle.maxLoadCapacity)} kg. Dispatch blocked.`);
      return;
    }
    createMutation.mutate({
      ...newTrip,
      cargoWeight: Number(newTrip.cargoWeight),
      plannedDistance: Number(newTrip.plannedDistance),
      scheduledAt: new Date(newTrip.scheduledAt).toISOString(),
    });
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    completeMutation.mutate({
      id: selectedTrip.id,
      body: {
        actualDistance: Number(actualDistance),
        endOdometer: Number(endOdometer),
        revenue: Number(revenue),
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trips & Dispatch Console"
        description="Schedule, dispatch, and track cargo dispatches"
        actions={
          isAuthorized ? (
            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Draft Trip
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <span className="text-sm font-semibold text-slate-700">Filter Status:</span>
        {['', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === st
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st || 'All Trips'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trips Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {tripsLoading ? (
            <div className="p-8 text-center text-slate-500">Loading trips...</div>
          ) : trips?.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No trips found matching filter.</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-3">Trip Number</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Scheduled At</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {trips?.map((trip) => (
                  <tr
                    key={trip.id}
                    className={`hover:bg-slate-50/50 cursor-pointer ${
                      selectedTrip?.id === trip.id ? 'bg-brand-50/20' : ''
                    }`}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{trip.tripNumber}</td>
                    <td className="px-6 py-4">
                      <div className="truncate max-w-[200px]" title={`${trip.source} → ${trip.destination}`}>
                        {trip.source} → {trip.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(trip.scheduledAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={trip.status} />
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        onClick={() => setSelectedTrip(trip)}
                      >
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Trip Details Drawer/Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit space-y-6">
          {selectedTrip ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono font-bold">{selectedTrip.id}</span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedTrip.tripNumber}</h3>
                </div>
                <StatusBadge status={selectedTrip.status} />
              </div>

              {/* Route */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Route</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center text-slate-700 gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span><strong>Source:</strong> {selectedTrip.source}</span>
                  </div>
                  <div className="flex items-center text-slate-700 gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span><strong>Destination:</strong> {selectedTrip.destination}</span>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Assigned Fleet & Driver</h4>
                
                {/* Vehicle */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase">Vehicle</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{selectedTrip.vehicle?.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedTrip.vehicle?.registrationNumber} ({selectedTrip.vehicle?.type})</p>
                  <p className="text-xs text-slate-600 mt-1">Capacity: {selectedTrip.vehicle?.maxLoadCapacity} kg | Odometer: {selectedTrip.vehicle?.odometer} km</p>
                </div>

                {/* Driver */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase">Driver</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{selectedTrip.driver?.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedTrip.driver?.licenseCategory} - Expiry: {new Date(selectedTrip.driver?.licenseExpiryDate).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-600 mt-1">Safety Rating: {selectedTrip.driver?.safetyScore}/10.0</p>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Cargo Weight</span>
                  <span className="font-bold text-slate-900">{selectedTrip.cargoWeight} kg</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Planned Distance</span>
                  <span className="font-bold text-slate-900">{selectedTrip.plannedDistance} km</span>
                </div>
              </div>

              {/* Status Specific Metrics */}
              {selectedTrip.status === 'COMPLETED' && (
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100 text-sm bg-emerald-50/30 p-3 rounded-lg border border-emerald-100">
                  <div>
                    <span className="text-xs text-emerald-700 block font-semibold">Actual Distance</span>
                    <span className="font-bold text-slate-950">{selectedTrip.actualDistance} km</span>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 block font-semibold">End Odometer</span>
                    <span className="font-bold text-slate-950">{selectedTrip.endOdometer} km</span>
                  </div>
                  {selectedTrip.revenue !== null && selectedTrip.revenue !== undefined && (
                    <div className="col-span-2 mt-2 pt-2 border-t border-emerald-100">
                      <span className="text-xs text-emerald-700 block font-semibold">Attributed Revenue</span>
                      <span className="font-bold text-slate-950">${selectedTrip.revenue}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {isAuthorized && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  {selectedTrip.status === 'DRAFT' && (
                    <>
                      <Button
                        onClick={() => setIsDispatchOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600"
                      >
                        <Send className="h-4 w-4" /> Dispatch Cargo
                      </Button>
                      <Button
                        onClick={() => setIsCancelOpen(true)}
                        variant="danger"
                        className="w-full flex items-center justify-center gap-2 py-2.5"
                      >
                        <Ban className="h-4 w-4" /> Cancel Trip
                      </Button>
                    </>
                  )}

                  {selectedTrip.status === 'DISPATCHED' && (
                    <>
                      <Button
                        onClick={() => {
                          setActualDistance(Number(selectedTrip.plannedDistance));
                          setEndOdometer(Number(selectedTrip.vehicle?.odometer) + Number(selectedTrip.plannedDistance));
                          setRevenue(0);
                          setIsCompleteOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Complete Trip
                      </Button>
                      <Button
                        onClick={() => setIsCancelOpen(true)}
                        variant="danger"
                        className="w-full flex items-center justify-center gap-2 py-2.5"
                      >
                        <Ban className="h-4 w-4" /> Cancel Dispatch
                      </Button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Eye className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No Trip Selected</p>
              <p className="text-xs mt-1 text-slate-500">Select a trip from the list to view specifications and trigger status dispatches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Create Trip Draft */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-xl w-full z-50 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Schedule Draft Trip</h3>
                <button onClick={() => setIsCreateOpen(false)}><X className="h-5 w-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Trip Number"
                    placeholder="e.g. TRIP-200"
                    value={newTrip.tripNumber}
                    onChange={(e) => setNewTrip({ ...newTrip, tripNumber: e.target.value })}
                    required
                  />
                  <Input
                    label="Scheduled Start Date"
                    type="datetime-local"
                    value={newTrip.scheduledAt}
                    onChange={(e) => setNewTrip({ ...newTrip, scheduledAt: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Source Warehouse"
                    placeholder="e.g. Houston, TX"
                    value={newTrip.source}
                    onChange={(e) => setNewTrip({ ...newTrip, source: e.target.value })}
                    required
                  />
                  <Input
                    label="Destination Hub"
                    placeholder="e.g. Dallas, TX"
                    value={newTrip.destination}
                    onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Assign Vehicle"
                    placeholder="Select Vehicle"
                    value={newTrip.vehicleId}
                    onChange={(e) => setNewTrip({ ...newTrip, vehicleId: e.target.value })}
                    options={vehicles?.map((v) => ({
                      value: v.id,
                      label: `${v.registrationNumber} - ${v.name} (Max: ${v.maxLoadCapacity}kg) - [${v.status}]`,
                    })) || []}
                    required
                  />
                  <Select
                    label="Assign Driver"
                    placeholder="Select Driver"
                    value={newTrip.driverId}
                    onChange={(e) => setNewTrip({ ...newTrip, driverId: e.target.value })}
                    options={drivers?.map((d) => ({
                      value: d.id,
                      label: `${d.name} (${d.licenseCategory}) - [${d.status}]`,
                    })) || []}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cargo Weight (kg)"
                    type="number"
                    value={newTrip.cargoWeight}
                    onChange={(e) => setNewTrip({ ...newTrip, cargoWeight: Number(e.target.value) })}
                    required
                  />
                  <Input
                    label="Planned Distance (km)"
                    type="number"
                    value={newTrip.plannedDistance}
                    onChange={(e) => setNewTrip({ ...newTrip, plannedDistance: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" isLoading={createMutation.isPending}>Save Draft</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Complete Trip */}
      {isCompleteOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCompleteOpen(false)} />
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full z-50 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Complete Trip Details</h3>
                <button onClick={() => setIsCompleteOpen(false)}><X className="h-5 w-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleComplete} className="space-y-4">
                <Input
                  label="Actual Distance Traveled (km)"
                  type="number"
                  value={actualDistance}
                  onChange={(e) => setActualDistance(Number(e.target.value))}
                  required
                />
                <Input
                  label="End Odometer Reading (km)"
                  type="number"
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(Number(e.target.value))}
                  required
                />
                <Input
                  label="Attributed Revenue ($)"
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                />

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button variant="outline" type="button" onClick={() => setIsCompleteOpen(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" isLoading={completeMutation.isPending}>Submit Completion</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dispatch Dialog */}
      <ConfirmDialog
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onConfirm={() => dispatchMutation.mutate(selectedTrip.id)}
        title="Confirm Dispatch"
        message={`Are you sure you want to dispatch ${selectedTrip?.tripNumber}? This will lock the assigned vehicle (${selectedTrip?.vehicle?.registrationNumber}) and driver (${selectedTrip?.driver?.name}) in ON_TRIP status.`}
        confirmText="Yes, Dispatch"
        isLoading={dispatchMutation.isPending}
      />

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate(selectedTrip.id)}
        title="Cancel Trip"
        message={`Are you sure you want to cancel ${selectedTrip?.tripNumber}? This action will cancel the dispatch and release the vehicle and driver back to AVAILABLE status.`}
        confirmText="Yes, Cancel"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};
