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
import { Plus, X, Wrench, Play, CheckCircle2, Ban } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionRecord, setActionRecord] = useState<any>(null);
  const [actionType, setActionType] = useState<'start' | 'complete' | 'cancel' | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthorized = user.role === 'FLEET_MANAGER';

  const [formData, setFormData] = useState({
    vehicleId: '',
    maintenanceType: '',
    description: '',
    cost: 0,
    scheduledAt: '',
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['maintenance', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      return api.get<any[]>(`/maintenance?${params.toString()}`);
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<any[]>('/vehicles'),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/maintenance', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Maintenance scheduled successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule maintenance');
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => api.post(`/maintenance/${id}/${action}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      const messages: Record<string, string> = {
        start: 'Maintenance started successfully',
        complete: 'Maintenance completed successfully',
        cancel: 'Maintenance cancelled successfully',
      };
      
      toast.success(messages[variables.action]);
      handleCloseAction();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to perform action');
      handleCloseAction();
    },
  });

  const handleOpenForm = () => {
    setFormData({
      vehicleId: '',
      maintenanceType: '',
      description: '',
      cost: 0,
      scheduledAt: '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleOpenAction = (record: any, action: 'start' | 'complete' | 'cancel') => {
    setActionRecord(record);
    setActionType(action);
  };

  const handleCloseAction = () => {
    setActionRecord(null);
    setActionType(null);
  };

  const handleConfirmAction = () => {
    if (actionRecord && actionType) {
      actionMutation.mutate({ id: actionRecord.id, action: actionType });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error('Vehicle is required');
      return;
    }
    if (formData.cost < 0) {
      toast.error('Cost cannot be negative');
      return;
    }
    createMutation.mutate({
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Management"
        description="Schedule and track fleet maintenance"
        actions={
          isAuthorized ? (
            <Button onClick={handleOpenForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Schedule Maintenance
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-slate-200 rounded-lg shadow-sm items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st || 'ALL RECORDS'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">Loading maintenance records...</div>
        ) : records?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Wrench className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No maintenance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono uppercase tracking-wider text-xxs">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Cost</th>
                  <th className="px-6 py-3">Timeline Dates</th>
                  <th className="px-6 py-3">Status</th>
                  {isAuthorized && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records?.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{record.vehicle?.registrationNumber}</td>
                    <td className="px-6 py-3.5 font-medium">{record.maintenanceType}</td>
                    <td className="px-6 py-3.5 max-w-xs truncate" title={record.description}>{record.description || '-'}</td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">${Number(record.cost).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-xxs leading-relaxed font-mono">
                      <div><span className="text-slate-400 uppercase">SCHED:</span> {record.scheduledAt ? new Date(record.scheduledAt).toLocaleDateString() : '-'}</div>
                      {record.startedAt && <div><span className="text-brand-600 uppercase">START:</span> {new Date(record.startedAt).toLocaleDateString()}</div>}
                      {record.completedAt && <div><span className="text-emerald-600 uppercase">COMPL:</span> {new Date(record.completedAt).toLocaleDateString()}</div>}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={record.status} />
                    </td>
                    {isAuthorized && (
                      <td className="px-6 py-3.5 text-right space-x-1">
                        {record.status === 'SCHEDULED' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenAction(record, 'start')} className="text-brand-600 hover:text-brand-700 p-1" title="Start">
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenAction(record, 'cancel')} className="text-red-600 hover:text-red-700 p-1" title="Cancel">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {record.status === 'IN_PROGRESS' && (
                          <Button variant="ghost" size="sm" onClick={() => handleOpenAction(record, 'complete')} className="text-emerald-600 hover:text-emerald-700" title="Complete">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Maintenance Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseForm} />
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full z-50 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Schedule Maintenance</h3>
                <button onClick={handleCloseForm}><X className="h-5 w-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Vehicle"
                  placeholder="Select Vehicle"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  options={vehicles?.map((v) => ({
                    value: v.id,
                    label: `${v.registrationNumber} - ${v.name} [${v.status}]`,
                  })) || []}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Maintenance Type"
                    placeholder="e.g. Oil Change, Repair"
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                    required
                  />
                  <Input
                    label="Estimated Cost ($)"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    required
                  />
                </div>
                <Input
                  label="Description"
                  placeholder="Details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Input
                  label="Scheduled At"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button variant="outline" type="button" onClick={handleCloseForm}>Cancel</Button>
                  <Button variant="primary" type="submit" isLoading={createMutation.isPending}>
                    Schedule
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!actionType}
        onClose={handleCloseAction}
        onConfirm={handleConfirmAction}
        title={
          actionType === 'start' ? 'Start Maintenance' :
          actionType === 'complete' ? 'Complete Maintenance' :
          'Cancel Maintenance'
        }
        message={
          actionType === 'start' ? `Are you sure you want to start maintenance for ${actionRecord?.vehicle?.registrationNumber}? This will put the vehicle IN_SHOP.` :
          actionType === 'complete' ? `Are you sure you want to complete maintenance for ${actionRecord?.vehicle?.registrationNumber}? This will make the vehicle AVAILABLE again.` :
          `Are you sure you want to cancel this scheduled maintenance?`
        }
        confirmText={
          actionType === 'start' ? 'Yes, Start' :
          actionType === 'complete' ? 'Yes, Complete' :
          'Yes, Cancel'
        }
        isLoading={actionMutation.isPending}
      />
    </div>
  );
};
