import Link from 'next/link';
import { ShieldCheck, Activity, Cpu, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans selection:bg-blue-500/30 overflow-hidden relative transition-colors duration-300">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-200/50 dark:border-neutral-800/50">
        <div className="text-2xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
          RigSense
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/login" 
            className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
          RigSense 1.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Smarter <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Hardware</span> Management
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          Monitor your workspaces, track hardware conditions in real-time, and ensure optimal performance with AI-driven insights. Everything you need to maintain your tech fleet seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-xl shadow-blue-500/20 text-lg group"
          >
            Start Managing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-800/50 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-6">
              <Cpu className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-neutral-100">Workspace Environments</h3>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
              Organize your hardware into AC and Non-AC environments. Track varying dust levels and physical conditions across different facilities effortlessly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-800/50 rounded-3xl p-8 hover:shadow-2xl hover:shadow-purple-500/5 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-6">
              <Activity className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-neutral-100">Service Logbook</h3>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
              Keep a detailed history of every maintenance action. Know exactly when a piece of equipment was serviced, cleaned, or replaced.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-800/50 rounded-3xl p-8 hover:shadow-2xl hover:shadow-green-500/5 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-neutral-100">Enterprise Security</h3>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
              Secured by industry-standard JWT authentication and encrypted data storage. Your workspace configurations and logs remain completely private.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-slate-500 dark:text-neutral-500 border-t border-slate-200/50 dark:border-neutral-800/50">
        <p className="text-sm">© {new Date().getFullYear()} RigSense. All rights reserved.</p>
      </footer>
    </div>
  );
}
