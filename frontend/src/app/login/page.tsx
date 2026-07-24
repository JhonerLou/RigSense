'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import zxcvbn from 'zxcvbn';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const supabase = createClient();
    
    if (isResetPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Password reset link sent! Please check your email.');
      }
      setLoading(false);
      return;
    }

    if (isSignUp) {
      // Validate password strength using zxcvbn (require at least score 3 "Good")
      if (strengthScore < 3) {
        setError('Password is too weak. Please choose a stronger password.');
        setLoading(false);
        return;
      }

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // If email confirmation is required, session might be null
        if (data.session) {
          router.push('/dashboard');
        } else {
          setSuccessMsg('Registration successful! Please check your email to verify your account.');
          setLoading(false);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 dark:bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/70 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl shadow-2xl p-8 relative z-10 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/10 mb-4">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            {isResetPassword ? 'Reset Password' : isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-2 text-sm">
            {isResetPassword 
              ? "Enter your email and we'll send a reset link"
              : isSignUp 
                ? 'Join us to start managing your hardware'
                : 'Sign in to access your Hardware Tracker dashboard'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
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
            <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-neutral-950/50 border border-slate-300 dark:border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {!isResetPassword && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 ml-1">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPassword(true);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-neutral-950/50 border border-slate-300 dark:border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-3 pl-12 pr-12 text-sm text-slate-900 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none transition-all"
                  placeholder="Enter your password"
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
          )}

          {/* Password Strength Indicator (Only for Sign Up) */}
          {isSignUp && !isResetPassword && (
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isResetPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {!isResetPassword && (
          <>
            <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 dark:before:border-neutral-800 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200 dark:after:border-neutral-800">
              <p className="mx-4 mb-0 text-center text-sm text-slate-500 dark:text-neutral-500">or continue with</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-neutral-950 hover:bg-slate-50 dark:hover:bg-neutral-900 border border-slate-300 dark:border-neutral-700/50 text-slate-700 dark:text-neutral-200 font-medium py-3 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              if (isResetPassword) {
                setIsResetPassword(false);
              } else {
                setIsSignUp(!isSignUp);
              }
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-sm transition-colors group"
          >
            {isResetPassword ? (
              <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Back to Sign In</span>
            ) : isSignUp ? (
              <>
                <span className="text-slate-600 dark:text-neutral-400">Already have an account? </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign In</span>
              </>
            ) : (
              <>
                <span className="text-slate-600 dark:text-neutral-400">Don&apos;t have an account? </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign Up</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
