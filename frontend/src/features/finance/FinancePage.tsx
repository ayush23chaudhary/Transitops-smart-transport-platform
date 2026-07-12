import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { KPICard } from '../../components/ui/KPICard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import {
  Plus,
  X,
  DollarSign,
  Droplet,
  Wrench,
  Receipt,
  Filter,
} from 'lucide-react';

export const FinancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<'expenses' | 'fuel'>('expenses');

  // Filter States
  const [vehicleIdFilter, setVehicleIdFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal States
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isFinancialAnalyst = user.role === 'FINANCIAL_ANALYST';

  // Form States
  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    tripId: '',
    liters: '',
    cost: '',
    odometerReading: '',
    recordedAt: new Date().toISOString().substring(0, 16),
  });

  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    tripId: '',
    category: 'OTHER',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().substring(0, 16),
  });

  // Query Params
  const filterParams = new URLSearchParams();
  if (vehicleIdFilter) filterParams.append('vehicleId', vehicleIdFilter);
  if (startDateFilter) filterParams.append('startDate', startDateFilter);
  if (endDateFilter) filterParams.append('endDate', endDateFilter);

  const expenseParams = new URLSearchParams(filterParams);
  if (categoryFilter) expenseParams.append('category', categoryFilter);

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['finance-summary', vehicleIdFilter, startDateFilter, endDateFilter],
    queryFn: () => api.get<any>(`/finance/summary?${filterParams.toString()}`),
  });

  const {
    data: expenses,
    isLoading: isExpensesLoading,
    error: expensesError,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ['expenses', vehicleIdFilter, startDateFilter, endDateFilter, categoryFilter],
    queryFn: () => api.get<any[]>(`/finance/expenses?${expenseParams.toString()}`),
  });

  const {
    data: fuelLogs,
    isLoading: isFuelLoading,
    error: fuelError,
    refetch: refetchFuel,
  } = useQuery({
    queryKey: ['fuel', vehicleIdFilter, startDateFilter, endDateFilter],
    queryFn: () => api.get<any[]>(`/finance/fuel?${filterParams.toString()}`),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-select'],
    queryFn: () => api.get<any[]>('/vehicles'),
  });

  const { data: trips } = useQuery({
    queryKey: ['trips-select'],
    queryFn: () => api.get<any[]>('/trips'),
  });

  // Mutations
  const createFuelMutation = useMutation({
    mutationFn: (body: any) => api.post('/finance/fuel', body),
    onSuccess: () => {
      toast.success('Fuel log created successfully.');
      setIsFuelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['fuel'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create fuel log.');
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (body: any) => api.post('/finance/expenses', body),
    onSuccess: () => {
      toast.success('Expense created successfully.');
      setIsExpenseModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create expense.');
    },
  });

  // Modal Open Handlers
  const handleOpenFuelModal = () => {
    setFuelForm({
      vehicleId: '',
      tripId: '',
      liters: '',
      cost: '',
      odometerReading: '',
      recordedAt: new Date().toISOString().substring(0, 16),
    });
    setIsFuelModalOpen(true);
  };

  const handleOpenExpenseModal = () => {
    setExpenseForm({
      vehicleId: '',
      tripId: '',
      category: 'OTHER',
      amount: '',
      description: '',
      expenseDate: new Date().toISOString().substring(0, 16),
    });
    setIsExpenseModalOpen(true);
  };

  // Form Submissions
  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const litersNum = parseFloat(fuelForm.liters);
    const costNum = parseFloat(fuelForm.cost);
    const odometerNum = parseFloat(fuelForm.odometerReading);

    if (!fuelForm.vehicleId) {
      toast.error('Vehicle is required');
      return;
    }
    if (isNaN(litersNum) || litersNum <= 0) {
      toast.error('Liters must be a positive number');
      return;
    }
    if (isNaN(costNum) || costNum <= 0) {
      toast.error('Cost must be a positive number');
      return;
    }
    if (isNaN(odometerNum) || odometerNum < 0) {
      toast.error('Odometer reading must be non-negative');
      return;
    }

    createFuelMutation.mutate({
      vehicleId: fuelForm.vehicleId,
      tripId: fuelForm.tripId || null,
      liters: litersNum,
      cost: costNum,
      odometerReading: odometerNum,
      recordedAt: new Date(fuelForm.recordedAt).toISOString(),
    });
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseForm.amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }
    if (!expenseForm.description.trim()) {
      toast.error('Description is required');
      return;
    }

    createExpenseMutation.mutate({
      vehicleId: expenseForm.vehicleId || null,
      tripId: expenseForm.tripId || null,
      category: expenseForm.category,
      amount: amountNum,
      description: expenseForm.description,
      expenseDate: new Date(expenseForm.expenseDate).toISOString(),
    });
  };

  const handleClearFilters = () => {
    setVehicleIdFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setCategoryFilter('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel & Expense Management"
        description="Monitor costs, log refills, and manage general business expenses"
        actions={
          isFinancialAnalyst ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleOpenFuelModal}
                className="flex items-center gap-2"
              >
                <Droplet className="h-4 w-4 text-brand-600" /> Log Fuel
              </Button>
              <Button
                variant="primary"
                onClick={handleOpenExpenseModal}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Log Expense
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Operational Cost"
          value={`$${Number(summary?.totalOperationalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          loading={isSummaryLoading}
        />
        <KPICard
          title="Fuel Expenses"
          value={`$${Number(summary?.fuelCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Droplet}
          loading={isSummaryLoading}
        />
        <KPICard
          title="Maintenance Expenses"
          value={`$${Number(summary?.maintenanceCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wrench}
          loading={isSummaryLoading}
        />
        <KPICard
          title="General Expenses"
          value={`$${Number(summary?.expenseCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Receipt}
          loading={isSummaryLoading}
        />
      </div>

      {/* Filters section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 border-b pb-2">
          <Filter className="h-4 w-4" /> Filter Records
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Vehicle"
            value={vehicleIdFilter}
            onChange={(e) => setVehicleIdFilter(e.target.value)}
            placeholder="All Vehicles"
            options={(vehicles || []).map((v) => ({
              value: v.id,
              label: `${v.registrationNumber} - ${v.name}`,
            }))}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
          />
          {selectedTab === 'expenses' ? (
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="All Categories"
              options={[
                { value: 'TOLL', label: 'Toll' },
                { value: 'PARKING', label: 'Parking' },
                { value: 'REPAIR', label: 'Repair' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
                { value: 'INSURANCE', label: 'Insurance' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          ) : (
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full text-slate-500 hover:text-slate-700"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        {selectedTab === 'expenses' && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSelectedTab('expenses')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
            selectedTab === 'expenses'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          General Expenses
        </button>
        <button
          onClick={() => setSelectedTab('fuel')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
            selectedTab === 'fuel'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Fuel Logs
        </button>
      </div>

      {/* Data tables rendering */}
      {selectedTab === 'expenses' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {isExpensesLoading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">
              Loading expenses...
            </div>
          ) : expensesError ? (
            <div className="p-6">
              <ErrorState
                message={(expensesError as any).message || 'Failed to load expenses'}
                onRetry={refetchExpenses}
              />
            </div>
          ) : !expenses || expenses.length === 0 ? (
            <EmptyState
              title="No Expenses Logged"
              description="No expense transactions found matching your filters."
              icon={Receipt}
              action={
                isFinancialAnalyst ? (
                  <Button onClick={handleOpenExpenseModal}>Log First Expense</Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Vehicle / Trip</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Logged By</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(exp.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100 uppercase">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                        {exp.vehicle && (
                          <div className="font-bold text-slate-900">
                            🚗 {exp.vehicle.registrationNumber}
                          </div>
                        )}
                        {exp.trip && (
                          <div className="text-slate-500">
                            ✈️ {exp.trip.tripNumber}
                          </div>
                        )}
                        {!exp.vehicle && !exp.trip && <span className="text-slate-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4">{exp.description}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {exp.creator?.name || 'System'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ${Number(exp.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {isFuelLoading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">
              Loading fuel logs...
            </div>
          ) : fuelError ? (
            <div className="p-6">
              <ErrorState
                message={(fuelError as any).message || 'Failed to load fuel logs'}
                onRetry={refetchFuel}
              />
            </div>
          ) : !fuelLogs || fuelLogs.length === 0 ? (
            <EmptyState
              title="No Fuel Logs Found"
              description="No fuel refill receipts logged for the selected period."
              icon={Droplet}
              action={
                isFinancialAnalyst ? (
                  <Button onClick={handleOpenFuelModal}>Log First Refill</Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Vehicle</th>
                    <th className="px-6 py-3">Trip</th>
                    <th className="px-6 py-3">Odometer Reading</th>
                    <th className="px-6 py-3">Liters</th>
                    <th className="px-6 py-3">Logged By</th>
                    <th className="px-6 py-3 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {fuelLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(log.recordedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {log.vehicle?.registrationNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">
                        {log.trip?.tripNumber || <span className="text-slate-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                        {Number(log.odometerReading).toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        {Number(log.liters).toFixed(2)} L
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {log.creator?.name || 'System'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ${Number(log.cost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fuel Log Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsFuelModalOpen(false)}
            />
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full z-50 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Log Fuel Refill</h3>
                <button onClick={() => setIsFuelModalOpen(false)}>
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleFuelSubmit} className="space-y-4">
                <Select
                  label="Vehicle"
                  value={fuelForm.vehicleId}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                  placeholder="Select Vehicle"
                  options={(vehicles || []).map((v) => ({
                    value: v.id,
                    label: `${v.registrationNumber} - ${v.name} (Current Odo: ${Number(v.odometer).toLocaleString()} km)`,
                  }))}
                  required
                />
                <Select
                  label="Associated Trip (Optional)"
                  value={fuelForm.tripId}
                  onChange={(e) => setFuelForm({ ...fuelForm, tripId: e.target.value })}
                  placeholder="None"
                  options={(trips || [])
                    .filter((t) => !fuelForm.vehicleId || t.vehicleId === fuelForm.vehicleId)
                    .map((t) => ({
                      value: t.id,
                      label: `${t.tripNumber} (${t.status})`,
                    }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Fuel Quantity (Liters)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45.5"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                    required
                  />
                  <Input
                    label="Refill Cost ($)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 85.00"
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Odometer Reading (km)"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 152000"
                    value={fuelForm.odometerReading}
                    onChange={(e) => setFuelForm({ ...fuelForm, odometerReading: e.target.value })}
                    required
                  />
                  <Input
                    label="Recorded Date & Time"
                    type="datetime-local"
                    value={fuelForm.recordedAt}
                    onChange={(e) => setFuelForm({ ...fuelForm, recordedAt: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsFuelModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={createFuelMutation.isPending}
                  >
                    Save Fuel Log
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsExpenseModalOpen(false)}
            />
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full z-50 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Log General Expense</h3>
                <button onClick={() => setIsExpenseModalOpen(false)}>
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Expense Category"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    options={[
                      { value: 'TOLL', label: 'Toll' },
                      { value: 'PARKING', label: 'Parking' },
                      { value: 'REPAIR', label: 'Repair' },
                      { value: 'MAINTENANCE', label: 'Maintenance' },
                      { value: 'INSURANCE', label: 'Insurance' },
                      { value: 'OTHER', label: 'Other' },
                    ]}
                  />
                  <Input
                    label="Amount ($)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 24.50"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Vehicle (Optional)"
                    value={expenseForm.vehicleId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
                    placeholder="None"
                    options={(vehicles || []).map((v) => ({
                      value: v.id,
                      label: v.registrationNumber,
                    }))}
                  />
                  <Select
                    label="Associated Trip (Optional)"
                    value={expenseForm.tripId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                    placeholder="None"
                    options={(trips || [])
                      .filter((t) => !expenseForm.vehicleId || t.vehicleId === expenseForm.vehicleId)
                      .map((t) => ({
                        value: t.id,
                        label: t.tripNumber,
                      }))}
                  />
                </div>
                <Input
                  label="Expense Date & Time"
                  type="datetime-local"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                  required
                />
                <Input
                  label="Description / Memo"
                  placeholder="e.g. Toll road payment from Houston to Austin"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  required
                />

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={createExpenseMutation.isPending}
                  >
                    Save Expense
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
