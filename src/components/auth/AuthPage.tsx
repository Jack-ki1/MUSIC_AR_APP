import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Building2, 
  AlertCircle,
  Eye,
  EyeOff,
  User,
  ArrowLeft
} from 'lucide-react';
import { UserRole, AuthUser, WorkspaceTenant } from '../../types';
import { 
  useAuth, 
  DEMO_USERS, 
  DEFAULT_WORKSPACES, 
  switchDemoRole, 
  switchWorkspace 
} from '../../services/authService';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  onLoginSuccess,
  onBackToHome
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('SENIOR_SCOUT');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('ws-east-africa-hq');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { signInGoogle, user: currentAuth } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInGoogle();
      setIsLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Google sign-in encountered an issue. You can also log in as an A&R Scout below.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Validate email format
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid label work email address.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      // Determine if logging in as known admin
      const isAdmin = email.toLowerCase() === 'kimothojackson1125@gmail.com' || selectedRole === 'ADMIN';
      const role: UserRole = isAdmin ? 'ADMIN' : selectedRole;

      const newUser: AuthUser = {
        uid: `usr-${Date.now().toString().slice(-6)}`,
        email,
        displayName: fullName || (email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
        role,
        workspaceId: selectedWorkspace,
        avatarUrl: `https://images.unsplash.com/photo-${role === 'ADMIN' ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'}?auto=format&fit=crop&w=150&q=80`
      };

      try {
        localStorage.setItem('breakout_radar_auth_user', JSON.stringify(newUser));
        // Also sync state
        switchDemoRole(role);
        switchWorkspace(selectedWorkspace);
      } catch {}

      setIsLoading(false);
      onLoginSuccess();
    }, 450);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    switchWorkspace('ws-east-africa-hq');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">

      {/* Back to Home Button */}
      <button
        onClick={onBackToHome}
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer p-2 rounded-full hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4 text-[#C8F51F]" />
        <span>Back to Overview</span>
      </button>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-20 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3B6CFF] to-[#C8F51F] p-[2px] shadow-[0_0_30px_rgba(200,245,31,0.3)] mb-1">
            <div className="w-full h-full bg-[#0B1530] rounded-2xl flex items-center justify-center">
              <svg width="24" height="18" viewBox="0 0 22 16" fill="none" stroke="#C8F51F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8h3l2-6 3 12 3-10 2 4h7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === 'signin' ? 'Sign in to Breakout Radar' : 'Create A&R Scout Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signin'
              ? 'Access real-time discovery surveillance and AVM portfolios'
              : 'Deploy a collaborative workspace with live catalogue feeds'}
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Google One-Click Login */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-white text-[#0B1530] hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] font-mono uppercase text-slate-400">or sign in with credentials</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jackson Kimotho"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-[#C8F51F] text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@label.com or kimothojackson1125@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-[#C8F51F] text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-[#C8F51F] text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Workspace Tenant
                  </label>
                  <select
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 focus:border-[#C8F51F] text-xs text-white focus:outline-none"
                  >
                    {DEFAULT_WORKSPACES.map((ws: WorkspaceTenant) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name} ({ws.territory})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 focus:border-[#C8F51F] text-xs text-white focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN (Head of A&R / Executive)</option>
                    <option value="SENIOR_SCOUT">SENIOR SCOUT (A&R Director)</option>
                    <option value="SCOUT">SCOUT (Field Scout / Analyst)</option>
                    <option value="VIEWER">VIEWER (Legal / Read-Only Guest)</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#C8F51F] text-[#0B1530] font-black text-xs hover:bg-[#d8ff3d] hover:shadow-[0_0_24px_rgba(200,245,31,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : mode === 'signin' ? 'Enter Workspace' : 'Create & Enter'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle between Sign In / Sign Up */}
          <div className="text-center text-xs text-slate-400">
            {mode === 'signin' ? (
              <span>
                Don't have an A&R seat?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-[#C8F51F] font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already provisioned?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-[#C8F51F] font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Authorized Team Access */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
            ⚡ Authorized Team Access (Direct Login)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C8F51F]" />
              <span>Admin (Jackson)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('SENIOR_SCOUT')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#3B6CFF]" />
              <span>Senior Scout (Sarah)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
