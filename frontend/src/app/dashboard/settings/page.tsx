'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { 
  Save, User, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle,
  Palette, Bell, Shield, Smartphone, Briefcase, Moon, Sun, Monitor
} from 'lucide-react';
import Link from 'next/link';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
    email: '',
    phoneNumber: '',
    jobTitle: ''
  });

  // Apperance State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Notification State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata || {};
        setFormData({
          fullName: meta.full_name || '',
          avatarUrl: meta.avatar_url || '',
          phoneNumber: user.phone || meta.phone_number || '',
          jobTitle: meta.job_title || '',
          email: user.email || ''
        });
        
        // Restore local preferences
        if (typeof window !== 'undefined') {
          const savedTheme = localStorage.getItem('theme') as any;
          if (savedTheme) setTheme(savedTheme);
          
          const alerts = localStorage.getItem('emailAlerts');
          if (alerts) setEmailAlerts(alerts === 'true');
          
          const reports = localStorage.getItem('weeklyReports');
          if (reports) setWeeklyReports(reports === 'true');
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveStatus('idle');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSaveStatus('idle');
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, avatarUrl: data.url }));
      } else {
        setSaveStatus('error');
        setErrorMessage(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');

    // Save notifications to local storage since they are just client preferences for now
    localStorage.setItem('emailAlerts', emailAlerts.toString());
    localStorage.setItem('weeklyReports', weeklyReports.toString());

    // Save profile to Supabase
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.fullName,
        avatar_url: formData.avatarUrl,
        phone_number: formData.phoneNumber,
        job_title: formData.jobTitle
      }
    });

    if (error) {
      setSaveStatus('error');
      setErrorMessage(error.message);
    } else {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-neutral-400 mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20' 
                  : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-neutral-500'}`} />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Public Profile</h2>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">This information will be displayed on your workspace.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-8 border-b border-slate-100 dark:border-neutral-800">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-neutral-700 shadow-lg shrink-0">
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                          {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 w-full">
                      <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400" /> Upload Profile Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/10 dark:file:text-blue-400"
                      />
                      {isUploading && <p className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" /> Full Name
                    </label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> Job Title
                    </label>
                    <input
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="e.g. System Administrator"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-400" /> Phone Number
                    </label>
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-blue-500 transition-all [&_.PhoneInput]:w-full [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:text-slate-900 dark:[&_.PhoneInputInput]:text-white [&_.PhoneInputCountryIcon]:rounded-sm [&_.PhoneInputCountryIcon]:shadow-sm [&_.PhoneInputCountrySelect]:bg-white dark:[&_.PhoneInputCountrySelect]:bg-neutral-900 [&_.PhoneInputCountrySelect]:text-slate-900 dark:[&_.PhoneInputCountrySelect]:text-white">
                      <PhoneInput
                        international
                        defaultCountry="ID"
                        value={formData.phoneNumber}
                        onChange={(value) => {
                          setFormData(prev => ({ ...prev, phoneNumber: value || '' }));
                          setSaveStatus('idle');
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">
                      Email Address
                    </label>
                    <input
                      disabled
                      value={formData.email}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Appearance</h2>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">Customize how RigSense looks on your device.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    onClick={() => handleThemeChange('light')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'}`}
                  >
                    <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span className="font-medium text-slate-700 dark:text-neutral-300">Light Mode</span>
                  </div>
                  
                  <div 
                    onClick={() => handleThemeChange('dark')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'}`}
                  >
                    <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span className="font-medium text-slate-700 dark:text-neutral-300">Dark Mode</span>
                  </div>

                  <div 
                    onClick={() => handleThemeChange('system')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'}`}
                  >
                    <Monitor className={`w-8 h-8 ${theme === 'system' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span className="font-medium text-slate-700 dark:text-neutral-300">System</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Notifications</h2>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">Choose what updates you want to receive.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-neutral-800">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Email Alerts</h4>
                      <p className="text-sm text-slate-500 dark:text-neutral-400">Receive an email when AI detects critical hardware anomalies.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-neutral-800">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Weekly Reports</h4>
                      <p className="text-sm text-slate-500 dark:text-neutral-400">Receive a weekly summary of your workspaces performance.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={weeklyReports} onChange={(e) => setWeeklyReports(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Security</h2>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">Manage your security preferences and passwords.</p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/20">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Change Password</h4>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">You can update your password at any time to keep your account secure.</p>
                  <Link href="/update-password">
                    <button type="button" className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg text-sm hover:opacity-90 transition-opacity">
                      Update Password
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Global Action Bar */}
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                {saveStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-in slide-in-from-left-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings saved successfully</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 animate-in slide-in-from-left-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{errorMessage}</span>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 shrink-0"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
