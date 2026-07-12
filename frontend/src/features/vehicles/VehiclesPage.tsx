import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Plus, X, Edit, Car } from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthorized = user.role === 'FLEET_MANAGER';

  const [formData, setFormData] = useState({
    registrationNumber: '',
    name: '',
    type: '',
    maxLoadCapacity: 0,
    odometer: 0,
    acquisitionCost: 0,
    status: 'AVAILABLE',
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const q = params.toString();
      return api.get<any[]>(`/vehicles${q ? `?${q}` : ''}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/vehicles', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create vehicle');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.patch(`/vehicles/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update vehicle');
    },
  });

  const handleOpenForm = (vehicle?: any) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        maxLoadCapacity: Number(vehicle.maxLoadCapacity),
        odometer: Number(vehicle.odometer),
        acquisitionCost: Number(vehicle.acquisitionCost),
        status: vehicle.status,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        registrationNumber: '',
        name: '',
        type: '',
        maxLoadCapacity: 0,
        odometer: 0,
        acquisitionCost: 0,
        status: 'AVAILABLE',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.maxLoadCapacity <= 0) {
      toast.error('Max load capacity must be positive');
      return;
    }
    if (formData.odometer < 0 || formData.acquisitionCost < 0) {
      toast.error('Values cannot be negative');
      return;
    }

    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Registry"
        description="Manage your fleet vehicles and check their status"
        actions={
          isAuthorized ? (
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-slate-200 rounded-lg shadow-sm items-center justify-between">
        <Input
          placeholder="Search by name or registration..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs w-full"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {['', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st || 'ALL VEHICLES'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">Loading vehicles...</div>
        ) : vehicles?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Car className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No vehicles found in fleet registry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono uppercase tracking-wider text-xxs">
                  <th className="px-6 py-3">Registration</th>
                  <th className="px-6 py-3">Name / Model</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3">Odometer</th>
                  <th className="px-6 py-3">Status</th>
                  {isAuthorized && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vehicles?.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{vehicle.registrationNumber}</td>
                    <td className="px-6 py-3.5 font-medium">{vehicle.name}</td>
                    <td className="px-6 py-3.5">{vehicle.type}</td>
                    <td className="px-6 py-3.5 font-mono tabular-nums">{Number(vehicle.maxLoadCapacity).toLocaleString()} kg</td>
                    <td className="px-6 py-3.5 font-mono tabular-nums">{Number(vehicle.odometer).toLocaleString()} km</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    {isAuthorized && (
                      <td className="px-6 py-3.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenForm(vehicle)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseForm} />
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full z-50 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-lg">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                <button onClick={handleCloseForm}><X className="h-5 w-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Registration Number"
                    placeholder="e.g. TX-1234"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    required
                  />
                  <Input
                    label="Name / Model"
                    placeholder="e.g. Volvo FH16"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Type"
                    placeholder="e.g. Heavy Duty"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  />
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { value: 'AVAILABLE', label: 'AVAILABLE' },
                      { value: 'ON_TRIP', label: 'ON_TRIP' },
                      { value: 'IN_SHOP', label: 'IN_SHOP' },
                      { value: 'RETIRED', label: 'RETIRED' },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Load Capacity (kg)"
                    type="number"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: Number(e.target.value) })}
                    required
                  />
                  <Input
                    label="Odometer (km)"
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
                    required
                  />
                </div>
                <Input
                  label="Acquisition Cost ($)"
                  type="number"
                  value={formData.acquisitionCost}
                  onChange={(e) => setFormData({ ...formData, acquisitionCost: Number(e.target.value) })}
                  required
                />

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button variant="outline" type="button" onClick={handleCloseForm}>Cancel</Button>
                  <Button variant="primary" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                    {editingVehicle ? 'Update' : 'Save'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
