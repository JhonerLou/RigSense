import { createClient } from '@/utils/supabase/server';
import { Wind, Thermometer, AlertTriangle, CheckCircle, Activity, Server, HardDrive, FileText, ActivitySquare, BellRing } from 'lucide-react';
import Link from 'next/link';
import AddWorkspaceButton from '@/components/AddWorkspaceButton';
import OverviewCharts from '@/components/OverviewCharts';

type Workspace = {
  id: string;
  name: string;
  facility_type: 'AC' | 'NON_AC';
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  let workspaces: Workspace[] = [];
  let errorMsg = null;

  try {
    const res = await fetch('http://localhost:8080/api/workspaces', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const errorData = await res.json();
      errorMsg = errorData.error || 'Failed to fetch workspaces';
    } else {
      const result = await res.json();
      workspaces = result.data || [];
    }
  } catch (e: any) {
    errorMsg = 'Backend server is unreachable. Is it running on port 8080?';
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header & Quick Menu (Deretan Tombol) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            Overview Dashboard
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1 text-sm">
            Welcome back! Here is what's happening across all your facilities.
          </p>
        </div>
        
        {/* Quick Menu */}
        <div className="flex flex-wrap items-center gap-3">
          <AddWorkspaceButton />
          <button className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm">
            <HardDrive className="w-4 h-4" />
            Register Device
          </button>
          <button className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm">
            <FileText className="w-4 h-4" />
            System Report
          </button>
        </div>
      </div>

      {/* 2. Global Stats (Kartu Statistik) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workspaces */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">Total Workspaces</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                {workspaces.length}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Server className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Connected Devices (Mock Data) */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">Active Devices</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                12
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ActivitySquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Alerts (Mock Data) */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">Active Alerts</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                1
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <BellRing className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* System Health (Mock Data) */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">System Health</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                98%
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Overview Charts */}
      <div className="mt-8">
        <OverviewCharts />
      </div>

      {/* 3. My Workspaces List */}
      <div>
        <div className="flex items-center justify-between mb-4 mt-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-neutral-100">My Workspaces</h2>
        </div>

        {errorMsg ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
            <div>
              <h3 className="text-red-600 dark:text-red-400 font-medium">Failed to load workspaces</h3>
              <p className="text-red-500 dark:text-red-400/80 text-sm mt-1">{errorMsg}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.length === 0 ? (
              <div className="col-span-full bg-slate-100/50 dark:bg-neutral-900/30 border border-slate-200 dark:border-neutral-800/50 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <Server className="w-12 h-12 text-slate-400 dark:text-neutral-600 mb-4" />
                <h3 className="text-slate-700 dark:text-neutral-300 font-medium text-lg">No workspaces found</h3>
                <p className="text-slate-500 dark:text-neutral-500 text-sm mt-2 max-w-sm">
                  You haven't created any workspaces yet. Click the "Add Workspace" button above to start tracking hardware.
                </p>
              </div>
            ) : (
              workspaces.map((workspace) => (
                <Link href={`/dashboard/workspaces/${workspace.id}`} key={workspace.id} className="block group">
                  <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-blue-500/10 h-full flex flex-col">
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-100 dark:bg-neutral-800/50 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                        {workspace.facility_type === 'AC' ? (
                          <Wind className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Thermometer className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                        )}
                      </div>
                      <div className="px-3 py-1 bg-slate-50 dark:bg-neutral-800/50 rounded-full border border-slate-200 dark:border-neutral-700/50">
                        <span className={`text-xs font-semibold ${workspace.facility_type === 'AC' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {workspace.facility_type === 'AC' ? 'AC Environment' : 'Non-AC Environment'}
                        </span>
                      </div>
                    </div>
  
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {workspace.name}
                    </h3>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-800/50 flex-1 flex flex-col justify-end space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-neutral-500 flex items-center gap-1.5">
                          <Activity className="w-4 h-4" />
                          Dust Level
                        </span>
                        <span className="font-medium text-slate-700 dark:text-neutral-300">
                          {/* Mock data until backend provides this */
                           workspace.facility_type === 'AC' ? 'Low' : 'High'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-neutral-500 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          Status
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
                          Optimal
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
