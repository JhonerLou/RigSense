'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Server, Wind, Thermometer, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AddWorkspaceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [envType, setEnvType] = useState('AC');
  const [dustLevel, setDustLevel] = useState('LOW');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('http://localhost:8080/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          name: name,
          environment_type: envType,
          dust_level: dustLevel
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create workspace');
      }

      setIsOpen(false);
      setName('');
      setEnvType('AC');
      setDustLevel('LOW');
      
      // Refresh the server component to show the new workspace
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Workspace
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-500" />
                New Workspace
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-500 dark:text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Main Server Room"
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                  Environment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEnvType('AC')}
                    className={`flex items-center justify-center gap-2 py-3 border rounded-xl text-sm font-medium transition-all ${
                      envType === 'AC' 
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'bg-white dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Wind className="w-4 h-4" />
                    AC Facility
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvType('NON_AC')}
                    className={`flex items-center justify-center gap-2 py-3 border rounded-xl text-sm font-medium transition-all ${
                      envType === 'NON_AC' 
                        ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400' 
                        : 'bg-white dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Thermometer className="w-4 h-4" />
                    Non-AC
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                  Initial Dust Level
                </label>
                <select
                  value={dustLevel}
                  onChange={(e) => setDustLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="LOW">Low (Normal condition)</option>
                  <option value="MEDIUM">Medium (Needs attention soon)</option>
                  <option value="HIGH">High (Critical condition)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    'Create Workspace'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
