'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Lock, Loader2, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import zxcvbn from 'zxcvbn';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const passwordEvaluation = password ? zxcvbn(password) : null;
  const strengthScore = passwordEvaluation ? passwordEvaluation.score : -1;
  const suggestions = passwordEvaluation ? passwordEvaluation.feedback.suggestions : [];
  
  const getStrengthColor = (level: number) => {
    if (strengthScore === -1) return 'bg-neutral-800';
    if (strengthScore <= 1) return level <= 1 ? 'bg-red-500' : 'bg-neutral-800';
    if (strengthScore === 2) return level <= 2 ? 'bg-orange-500' : 'bg-neutral-800';
    if (strengthScore === 3) return level <= 3 ? 'bg-yellow-500' : 'bg-neutral-800';
    if (strengthScore === 4) return level <= 4 ? 'bg-green-500' : 'bg-neutral-800';
    return 'bg-neutral-800';
  };

  const getStrengthText = () => {
    if (strengthScore === -1) return '';
    if (strengthScore === 0) return 'Very Weak';
    if (strengthScore === 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    if (strengthScore === 4) return 'Strong';
  };

  const getStrengthTextColor = () => {
    if (strengthScore <= 1) return 'text-red-400';
    if (strengthScore === 2) return 'text-orange-400';
    if (strengthScore === 3) return 'text-yellow-400';
    if (strengthScore === 4) return 'text-green-400';
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Require at least score 3 for good password entropy
    if (strengthScore < 3) {
      setError('Password is too weak. Please choose a stronger password.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccessMsg('Password updated successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-neutral-100 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-400/20 dark:bg-green-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/70 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl shadow-2xl p-8 relative z-10 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/10 mb-4">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            Update Password
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-2 text-sm">
            Please enter your new strong password below.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
              {successMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-neutral-950/50 border border-slate-300 dark:border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-3 pl-12 pr-12 text-sm text-slate-900 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none transition-all"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 dark:bg-neutral-950/50 rounded-xl border border-slate-200 dark:border-neutral-800/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-neutral-400">Password Strength:</span>
              <span className={`font-medium ${getStrengthTextColor()}`}>
                {getStrengthText() || 'None'}
              </span>
            </div>
            <div className="flex gap-1.5 h-1.5">
              <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(1)}`} />
              <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(2)}`} />
              <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(3)}`} />
              <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(4)}`} />
            </div>
            
            {suggestions.length > 0 && strengthScore < 3 && (
              <div className="text-xs space-y-1.5 mt-2 text-neutral-400">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save New Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
