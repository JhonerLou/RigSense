import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import WorkspaceClient from './WorkspaceClient';

export default async function WorkspaceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  let workspace = null;
  let devices: unknown[] = [];
  let errorMsg = null;

  try {
    const res = await fetch(`http://localhost:8080/api/workspaces/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) return notFound();
      const errorData = await res.json();
      errorMsg = errorData.error || 'Failed to fetch workspace details';
    } else {
      const result = await res.json();
      workspace = result.data;

      // Fetch devices
      const devRes = await fetch(`http://localhost:8080/api/workspaces/${id}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (devRes.ok) {
        const devResult = await devRes.json();
        devices = devResult.data || [];
      }
    }
  } catch {
    errorMsg = 'Backend server is unreachable. Is it running on port 8080?';
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumb */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Workspaces
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            {workspace?.name || 'Workspace Details'}
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1 text-sm">
            Detailed analytics and registered devices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 px-4 py-2 rounded-xl font-medium transition-colors text-sm shadow-sm">
            Edit Details
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 text-sm">
            Generate Report
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
          <div>
            <h3 className="text-red-600 dark:text-red-400 font-medium">Failed to load details</h3>
            <p className="text-red-500 dark:text-red-400/80 text-sm mt-1">{errorMsg}</p>
          </div>
        </div>
      ) : workspace ? (
        <WorkspaceClient workspace={workspace} initialDevices={devices} />
      ) : null}
    </div>
  );
}
