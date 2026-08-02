import { createClient } from '@/utils/supabase/server';
import { Wrench, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export interface DeviceMaintenanceOverview {
  device_id: string;
  device_name: string;
  category: string;
  workspace_name: string;
  overall_status: 'OK' | 'DUE_SOON' | 'OVERDUE';
  total_risk_impact_cost: number;
}

export default async function MaintenancePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  let overviews: DeviceMaintenanceOverview[] = [];
  let errorMsg = null;

  try {
    const res = await fetch('http://localhost:8080/api/maintenance-tasks/overview', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const errorData = await res.json();
      errorMsg = errorData.error || 'Failed to fetch maintenance overview';
    } else {
      const result = await res.json();
      overviews = result.data || [];
    }
  } catch {
    errorMsg = 'Backend server is unreachable.';
  }

  // Format currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" /> Predictive Maintenance
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-2 text-sm max-w-2xl">
            Monitor the maintenance status of all your registered hardware across workspaces. 
            Prioritize overdue services to minimize risk impact costs and prevent hardware failure.
          </p>
        </div>
      </div>

      {errorMsg ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
          <div>
            <h3 className="text-red-600 dark:text-red-400 font-medium">Failed to load maintenance data</h3>
            <p className="text-red-500 dark:text-red-400/80 text-sm mt-1">{errorMsg}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {overviews.length === 0 ? (
            <div className="bg-slate-100/50 dark:bg-neutral-900/30 border border-slate-200 dark:border-neutral-800/50 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-12 h-12 text-slate-400 dark:text-neutral-600 mb-4" />
              <h3 className="text-slate-700 dark:text-neutral-300 font-medium text-lg">No Devices Found</h3>
              <p className="text-slate-500 dark:text-neutral-500 text-sm mt-2 max-w-sm">
                You haven&apos;t added any devices to your workspaces yet, or there are no maintenance tasks generated.
              </p>
            </div>
          ) : (
            overviews.map((item) => (
              <div 
                key={item.device_id}
                className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50"
              >
                <div className="flex items-center gap-5">
                  {/* Status Indicator Badge */}
                  <div className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl border-2 ${
                    item.overall_status === 'OVERDUE' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : item.overall_status === 'DUE_SOON'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {item.overall_status === 'OVERDUE' ? <AlertTriangle className="w-6 h-6" /> 
                    : item.overall_status === 'DUE_SOON' ? <Clock className="w-6 h-6" /> 
                    : <CheckCircle className="w-6 h-6" />}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.device_name}</h3>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className="text-slate-500 dark:text-neutral-400 font-medium">{item.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-700"></span>
                      <span className="text-slate-500 dark:text-neutral-400">{item.workspace_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Risk Cost */}
                  <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-xl p-3 px-5 flex flex-col justify-center min-w-[200px]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-500 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Risk Impact Cost
                    </span>
                    <span className={`text-lg font-bold mt-0.5 ${
                      item.overall_status === 'OVERDUE' ? 'text-red-600 dark:text-red-400' 
                      : item.overall_status === 'DUE_SOON' ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {formatIDR(item.total_risk_impact_cost)}
                    </span>
                  </div>

                  {/* Actions */}
                  <button className="px-5 py-2.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium rounded-xl transition-colors text-sm">
                    View Schedule
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
