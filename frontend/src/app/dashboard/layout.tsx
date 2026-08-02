'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LayoutDashboard, BookOpen, Bot, LogOut, Menu, X, Settings, Wrench } from 'lucide-react';

const navItems = [
  { name: 'My Workspaces', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Predictive Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Service Logbook', href: '/dashboard/logbook', icon: BookOpen },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Bot },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; fullName: string; avatarUrl: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadata = user.user_metadata || {};
        setUserProfile({
          email: user.email || 'No email',
          fullName: metadata.full_name || 'Guest User',
          avatarUrl: metadata.avatar_url || ''
        });
      }
    };
    fetchUser();
    
    // Subscribe to auth changes (when they update profile)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setUserProfile({
          email: session.user.email || 'No email',
          fullName: metadata.full_name || 'Guest User',
          avatarUrl: metadata.avatar_url || ''
        });
      }
    });
    
    return () => { subscription.unsubscribe(); }
  }, []);

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
          {userProfile && (
            <Link href="/dashboard/settings" className="flex items-center gap-3 mb-4 px-2 hover:bg-slate-100 dark:hover:bg-neutral-800/50 p-2 rounded-xl transition-colors cursor-pointer group/profile">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-md border border-slate-200 dark:border-neutral-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {userProfile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 dark:text-neutral-200 truncate group-hover/profile:text-blue-500 transition-colors">{userProfile.fullName}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-500 truncate">{userProfile.email}</p>
              </div>
            </Link>
          )}
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
