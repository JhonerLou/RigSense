'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const mockAlertsData = [
  { name: 'Mon', alerts: 4 },
  { name: 'Tue', alerts: 7 },
  { name: 'Wed', alerts: 2 },
  { name: 'Thu', alerts: 5 },
  { name: 'Fri', alerts: 1 },
  { name: 'Sat', alerts: 0 },
  { name: 'Sun', alerts: 1 },
];

const mockDeviceData = [
  { name: 'Servers', value: 45 },
  { name: 'Networking', value: 25 },
  { name: 'HVAC Units', value: 15 },
  { name: 'IoT Sensors', value: 15 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'];

export default function OverviewCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Weekly Alerts Chart */}
      <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-neutral-100 mb-6">Weekly Alerts Volume</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAlertsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
              <Tooltip 
                cursor={{fill: '#94a3b8', opacity: 0.1}}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                itemStyle={{ color: '#ef4444' }}
              />
              <Bar dataKey="alerts" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Distribution Chart */}
      <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 shadow-sm transition-colors flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 dark:text-neutral-100 mb-2">Device Distribution</h3>
        <div className="flex-1 min-h-[16rem] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockDeviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {mockDeviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
