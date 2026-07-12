import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const FinancePage: React.FC = () => {
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.get<any[]>('/finance/expenses'),
  });

  const { data: fuel } = useQuery({
    queryKey: ['fuel'],
    queryFn: () => api.get<any[]>('/finance/fuel'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel & Expense Analytics"
        description="Extension point for Developer 4 (Intelligence)"
      />

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
        <h4 className="font-semibold mb-1">Developer 4 Scope (Finance & Expenses)</h4>
        <p>This module contains Expense reports, Fuel logs, and financial calculations. The backend integration routes are mounted at <code>GET /api/finance/expenses</code> and <code>GET /api/finance/fuel</code>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-semibold text-slate-800">
            Recent General Expenses
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses?.map((exp) => (
                <tr key={exp.id}>
                  <td className="px-6 py-4 font-semibold text-brand-600">{exp.category}</td>
                  <td className="px-6 py-4">{exp.description}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">${exp.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fuel Logs List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-semibold text-slate-800">
            Fuel Refill Logs
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Liters</th>
                <th className="px-6 py-3">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {fuel?.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{log.vehicle?.registrationNumber}</td>
                  <td className="px-6 py-4">{log.liters} L</td>
                  <td className="px-6 py-4 font-bold text-slate-900">${log.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
