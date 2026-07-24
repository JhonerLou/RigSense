'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Thermometer, Wind, Zap, Activity, Server, Cpu, Filter, Plus, Loader2 } from 'lucide-react';
import AddDeviceModal from '@/components/AddDeviceModal';
import { createClient } from '@/utils/supabase/client';

export default function WorkspaceClient({ workspace, initialDevices }: { workspace: Record<string, any>; initialDevices: any[] }) {
  const isAC = workspace.facility_type === 'AC';
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [latestStats, setLatestStats] = useState({ temp: 0, hum: 0, dust: 0, power: 0 });
  const [isAiLoading, setIsAiLoading] = useState(true);

  // Health Scan State
  const [isHealthScanOpen, setIsHealthScanOpen] = useState(false);
  const [isHealthScanLoading, setIsHealthScanLoading] = useState(false);
  const [healthScanData, setHealthScanData] = useState<any>(null);

  const runHealthScan = async () => {
    setIsHealthScanOpen(true);
    setIsHealthScanLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`http://localhost:8080/api/workspaces/${workspace.id}/health-scan`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      if (res.ok) {
        const result = await res.json();
        setHealthScanData(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch Health Scan:", err);
    } finally {
      setIsHealthScanLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchAITelemetry = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch(`http://localhost:8080/api/workspaces/${workspace.id}/ai-telemetry`, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        
        if (res.ok && isMounted) {
          const result = await res.json();
          const liveData = result.data;
          
          // Format time as HH:MM:SS
          const timeStr = new Date(liveData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newPoint = { 
            time: timeStr, 
            dust: liveData.dust_level, 
            temp: liveData.temperature, 
            humidity: liveData.humidity 
          };
          
          setLatestStats({
            temp: liveData.temperature,
            hum: liveData.humidity,
            dust: liveData.dust_level,
            power: liveData.power_usage
          });

          setTelemetry(prev => {
            const next = [...prev, newPoint];
            if (next.length > 7) return next.slice(next.length - 7); // keep last 7 points
            return next;
          });
          setIsAiLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch AI telemetry:", err);
      }
    };

    // Fetch immediately
    fetchAITelemetry();
    
    // Then poll every 10 seconds
    const interval = setInterval(fetchAITelemetry, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [workspace.id]);
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temp Card */}
        <div className="bg-slate-900/40 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-800 dark:border-neutral-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 dark:text-neutral-400 text-sm font-medium mb-1 flex items-center gap-2">
                Avg Temperature {isAiLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
              </p>
              <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {latestStats.temp > 0 ? latestStats.temp.toFixed(1) : '--'}°C
              </h3>
              <p className="text-sm font-medium">
                <span className={latestStats.temp > (isAC ? 25 : 30) ? 'text-red-400' : 'text-green-400'}>
                  {latestStats.temp > (isAC ? 25 : 30) ? 'Warning' : 'Optimal'}
                </span>
                <span className="text-slate-500"> range</span>
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-2xl">
              <Thermometer className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-slate-900/40 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-800 dark:border-neutral-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 dark:text-neutral-400 text-sm font-medium mb-1 flex items-center gap-2">
                Humidity {isAiLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
              </p>
              <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {latestStats.hum > 0 ? latestStats.hum.toFixed(0) : '--'}%
              </h3>
              <p className="text-sm font-medium">
                <span className={latestStats.hum > 60 ? 'text-orange-400' : 'text-green-400'}>
                  {latestStats.hum > 60 ? 'High' : 'Optimal'}
                </span>
                <span className="text-slate-500"> range</span>
              </p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-2xl">
              <Wind className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Airborne Dust Card */}
        <div className="bg-slate-900/40 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-800 dark:border-neutral-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 dark:text-neutral-400 text-sm font-medium mb-1 flex items-center gap-2">
                Airborne Dust {isAiLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
              </p>
              <h3 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-baseline gap-1">
                {latestStats.dust > 0 ? latestStats.dust.toFixed(0) : '--'} <span className="text-sm text-slate-400 font-normal">µg/m³</span>
              </h3>
              <p className="text-sm font-medium">
                <span className={latestStats.dust > 30 ? 'text-red-400' : 'text-slate-500'}>
                  {latestStats.dust > 30 ? 'High dust level' : 'Normal level'}
                </span>
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Power Usage Card */}
        <div className="bg-slate-900/40 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-800 dark:border-neutral-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 dark:text-neutral-400 text-sm font-medium mb-1 flex items-center gap-2">
                Est. Power Usage {isAiLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
              </p>
              <h3 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-baseline gap-1">
                {latestStats.power > 0 ? latestStats.power.toFixed(1) : '--'} <span className="text-sm text-slate-400 font-normal">kW</span>
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Average load
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-2xl">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dust Trend Chart */}
        <div className="bg-slate-900/40 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-800 dark:border-neutral-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              Dust Level Fluctuation {isAiLoading && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dustGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#a855f7' }}
                  />
                  <Area type="monotone" dataKey="dust" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#dustGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Env Variables */}
        <div className="bg-slate-900/40 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-800 dark:border-neutral-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              Env Variables (Temp & Humidity) {isAiLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Temp (°C)" />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Humidity (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Devices List Table */}
      <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-neutral-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-neutral-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            Registered Devices
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={runHealthScan}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-all shadow-md shadow-purple-500/20 text-sm"
            >
              <Zap className="w-4 h-4" />
              Run AI Diagnostics 🧠
            </button>
            <button 
              onClick={() => setIsAddDeviceOpen(true)}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Register Device
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800/50 text-slate-500 dark:text-neutral-500 text-sm">
                <th className="pb-3 font-medium px-4">Device Name</th>
                <th className="pb-3 font-medium px-4">Category</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4 text-right">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800/50">
              {initialDevices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-neutral-500">
                    No devices registered yet. Click "Register Device" to add one.
                  </td>
                </tr>
              ) : (
                initialDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-lg group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">
                          <Cpu className="w-4 h-4 text-slate-600 dark:text-neutral-400" />
                        </div>
                        <span className="font-medium text-slate-800 dark:text-neutral-200">{device.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-600 dark:text-neutral-400 text-sm">{device.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${device.workload_intensity === 'LIGHT' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 
                          device.workload_intensity === 'HEAVY' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' : 
                          'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'}`}
                      >
                        {device.workload_intensity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-neutral-500 text-right">
                      {new Date(device.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDeviceModal 
        workspaceId={workspace.id}
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
      />

      {/* AI Health Scan Modal */}
      {isHealthScanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-purple-500" />
                AI Health Diagnostics
              </h2>
              <button onClick={() => setIsHealthScanOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {isHealthScanLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                  <div className="relative mb-4">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                  </div>
                  <p className="font-medium animate-pulse">Gemini AI is analyzing workspace environment and hardware workload...</p>
                </div>
              ) : healthScanData ? (
                <div className="space-y-6">
                  {/* Health Score Overview */}
                  <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-800">
                    <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-8 shadow-inner bg-white dark:bg-neutral-900" style={{ borderColor: healthScanData.overall_health_score > 70 ? '#10b981' : healthScanData.overall_health_score > 40 ? '#f59e0b' : '#ef4444' }}>
                      <span className="text-4xl font-bold" style={{ color: healthScanData.overall_health_score > 70 ? '#10b981' : healthScanData.overall_health_score > 40 ? '#f59e0b' : '#ef4444' }}>
                        {healthScanData.overall_health_score}
                      </span>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Score</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{healthScanData.status}</h3>
                      <p className="text-slate-600 dark:text-slate-300">Based on the current environment ({workspace.environment_type}) and telemetry data, the overall hardware health is considered <strong className="lowercase">{healthScanData.status}</strong>.</p>
                    </div>
                  </div>
                  
                  {/* Issues */}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" /> Detected Issues
                    </h4>
                    <ul className="space-y-2">
                      {healthScanData.issues?.map((issue: string, idx: number) => (
                        <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-300 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/20">
                          <span className="text-orange-500 mt-0.5">•</span> {issue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Predictions */}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" /> Predictive Maintenance
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {healthScanData.predictions?.map((pred: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm relative overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-1 h-full ${pred.estimated_days_until_failure < 30 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                          <h5 className="font-bold text-slate-800 dark:text-white mb-1 pl-2">{pred.component}</h5>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 pl-2">
                            Est. Failure in: <strong className={pred.estimated_days_until_failure < 30 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}>{pred.estimated_days_until_failure} days</strong>
                          </p>
                          <div className="pl-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">Recommendation</span>
                            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-neutral-800 p-2 rounded-lg">{pred.recommended_action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-red-500">Failed to load diagnosis.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50 flex justify-end">
              <button 
                onClick={() => setIsHealthScanOpen(false)}
                className="px-6 py-2 bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-white font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-neutral-700 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
