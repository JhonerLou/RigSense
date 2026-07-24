'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LayoutDashboard, BookOpen, Bot, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { name: 'My Workspaces', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Service Logbook', href: '/dashboard/logbook', icon: BookOpen },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Bot },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 flex flex-col md:flex-row overflow-hidden relative transition-colors duration-300">
      {/* Global Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl z-20 relative transition-colors">
        <div className="font-bold text-xl tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
          RigSense
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-200 dark:bg-neutral-800 rounded-lg transition-colors">
          {sidebarOpen ? <X className="w-5 h-5 text-slate-700 dark:text-neutral-300" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-neutral-300" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-neutral-800/50 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 hidden md:block">
          <div className="font-bold text-2xl tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            RigSense
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1 uppercase tracking-widest font-semibold">Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-0 space-y-2 mt-4 md:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-100/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm'
                    : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-slate-700 dark:group-hover:text-neutral-300'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-neutral-800/50 transition-colors">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
