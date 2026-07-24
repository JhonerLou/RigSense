'use client';

import { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Thermometer, Wind, Zap, Activity, Server, Cpu, Filter, Plus } from 'lucide-react';
import AddDeviceModal from '@/components/AddDeviceModal';

const mockChartData = [
  { time: '08:00', dust: 12, temp: 22, humidity: 45 },
  { time: '10:00', dust: 15, temp: 23, humidity: 48 },
  { time: '12:00', dust: 11, temp: 24, humidity: 46 },
  { time: '14:00', dust: 18, temp: 25, humidity: 42 },
  { time: '16:00', dust: 14, temp: 23, humidity: 44 },
];

export default function WorkspaceClient({ workspace, initialDevices }: { workspace: Record<string, any>; initialDevices: any[] }) {
  const isAC = workspace.facility_type === 'AC';
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temp Card */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">Avg Temperature</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                {isAC ? '22.4°C' : '28.1°C'}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${isAC ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">-0.5°C</span>
            <span className="text-slate-500 dark:text-neutral-500 ml-2">from yesterday</span>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">Humidity</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                42%
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Wind className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">Optimal</span>
            <span className="text-slate-500 dark:text-neutral-500 ml-2">range 40-50%</span>
          </div>
        </div>

        {/* Dust Level Card */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">Airborne Dust</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                15 <span className="text-lg text-slate-500 dark:text-neutral-500">µg/m³</span>
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 dark:text-red-400 font-medium">+2 µg/m³</span>
            <span className="text-slate-500 dark:text-neutral-500 ml-2">trending up</span>
          </div>
        </div>

        {/* Filter Status / Power Usage Card */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-neutral-400 text-sm font-medium">
                {isAC ? 'HVAC Filter Status' : 'Est. Power Usage'}
              </p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-neutral-100 mt-1">
                {isAC ? '82%' : '4.2 kW'}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              {isAC ? <Filter className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={isAC ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-neutral-400 font-medium"}>
              {isAC ? 'Healthy' : 'Average load'}
            </span>
            <span className="text-slate-500 dark:text-neutral-500 ml-2">
              {isAC ? 'Needs replace at 20%' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dust Trend Chart */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-neutral-100 mb-6">Dust Level Fluctuation</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorDust" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#c4b5fd' }}
                />
                <Area type="monotone" dataKey="dust" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDust)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Humidity Chart */}
        <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-neutral-100 mb-6">Env Variables (Temp & Humidity)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} yAxisId="left" />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={10} yAxisId="right" orientation="right" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Temp (°C)" />
                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
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
          <button 
            onClick={() => setIsAddDeviceOpen(true)}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register Device
          </button>
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
    </div>
  );
}
