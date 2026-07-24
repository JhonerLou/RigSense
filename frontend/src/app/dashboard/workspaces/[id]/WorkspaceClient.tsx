'use client';

import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Thermometer, Wind, Zap, Activity, Server, Cpu, Filter } from 'lucide-react';

const mockChartData = [
  { time: '08:00', dust: 12, temp: 22, humidity: 45 },
  { time: '10:00', dust: 15, temp: 23, humidity: 42 },
  { time: '12:00', dust: 25, temp: 24, humidity: 38 },
  { time: '14:00', dust: 28, temp: 25, humidity: 35 },
  { time: '16:00', dust: 20, temp: 24, humidity: 40 },
  { time: '18:00', dust: 14, temp: 22, humidity: 44 },
];

const mockDevices = [
  { id: '1', name: 'Main Server Rack A', type: 'Server', status: 'Online', lastMaintenance: '2 days ago' },
  { id: '2', name: 'Network Switch Core', type: 'Networking', status: 'Warning', lastMaintenance: '5 months ago' },
  { id: '3', name: 'Cooling Unit 1', type: 'HVAC', status: 'Online', lastMaintenance: '1 week ago' },
];

export default function WorkspaceClient({ workspace }: { workspace: Record<string, unknown> }) {
  const isAC = workspace.facility_type === 'AC';
  
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-neutral-100">Registered Devices</h3>
          <button className="text-sm bg-slate-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors">
            + Register Device
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800/50 text-slate-500 dark:text-neutral-500 text-sm">
                <th className="pb-3 font-medium px-4">Device Name</th>
                <th className="pb-3 font-medium px-4">Category</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4 text-right">Last Maintenance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockDevices.map((device) => (
                <tr key={device.id} className="border-b border-slate-100 dark:border-neutral-800/30 hover:bg-slate-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-4 px-4 font-medium text-slate-800 dark:text-neutral-200 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-800">
                      {device.type === 'Server' ? <Server className="w-4 h-4 text-blue-500" /> : <Cpu className="w-4 h-4 text-purple-500" />}
                    </div>
                    {device.name}
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-neutral-400">{device.type}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      device.status === 'Online' 
                        ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' 
                        : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'Online' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                      {device.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-slate-600 dark:text-neutral-400">{device.lastMaintenance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
