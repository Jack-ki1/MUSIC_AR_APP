import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Command, 
  ShieldCheck, 
  ChevronDown, 
  Building2, 
  LogOut, 
  LogIn, 
  UserCheck, 
  Database,
  Radio,
  Lock,
  Sparkles
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { 
  getStoredAuthUser, 
  subscribeAuth, 
  switchDemoRole, 
  switchWorkspace, 
  signInWithGoogle, 
  signOutUser,
  DEFAULT_WORKSPACES 
} from '../../services/authService';

interface TopbarProps {
  onOpenGlobalSearch: () => void;
  apiConnected?: boolean;
  currentSection?: any;
  onOpenSettings?: () => void;
  activeArtistName?: string;
  onGoToHome?: () => void;
  onGoToAuth?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenGlobalSearch,
  apiConnected = true,
  onGoToHome,
  onGoToAuth,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser>(getStoredAuthUser());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  useEffect(() => {
    return subscribeAuth((user) => setCurrentUser(user));
  }, []);

  const activeWorkspace = DEFAULT_WORKSPACES.find(w => w.id === currentUser.workspaceId) || DEFAULT_WORKSPACES[0];

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#EFFBC4] text-[#0B1530] border-[#C8F51F]';
      case 'SENIOR_SCOUT':
        return 'bg-[#DFE9FF] text-[#3B6CFF] border-[#3B6CFF]/30';
      case 'SCOUT':
        return 'bg-[#EDE7FF] text-[#7C5CFF] border-[#7C5CFF]/30';
      case 'VIEWER':
        return 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]';
    }
  };

  return (
    <header className="h-18 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-[rgba(120,140,190,0.2)]">
      {/* 1. Global Search Bar (⌘K) */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between bg-white hover:bg-[#F8FAFC] border border-[rgba(120,140,190,0.25)] rounded-full px-5 py-2.5 text-xs text-[#5F6B8A] transition-all shadow-[0_14px_34px_-16px_rgba(59,92,170,0.25),inset_0_1px_0_#fff] group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#5F6B8A] group-hover:text-[#3B6CFF] transition-colors" />
            <span className="text-xs text-[#5F6B8A] font-medium">Search artist, city, ISRC, genre...</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] border border-[rgba(120,140,190,0.2)] px-2 py-0.5 rounded-full text-[10px] font-mono text-[#5F6B8A] font-bold">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* 2. Workspace Tenant & Data Provenance & RBAC Auth Controls */}
      <div className="flex items-center gap-3 ml-6 relative">
        {/* Workspace Tenant Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen);
              setIsProfileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[rgba(120,140,190,0.25)] text-xs text-[#0B1530] font-semibold cursor-pointer shadow-2xs transition-all"
            title="Multi-tenant workspace tenant selector"
          >
            <Building2 className="w-3.5 h-3.5 text-[#3B6CFF]" />
            <span className="max-w-[140px] truncate">{activeWorkspace.name}</span>
            <ChevronDown className="w-3 h-3 text-[#5F6B8A]" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl p-2 shadow-2xl border border-[rgba(120,140,190,0.25)] z-50 animate-in fade-in slide-in-from-top-2">
              <span className="text-[10px] font-bold text-[#5F6B8A] uppercase tracking-wider px-2 py-1 block">
                Active Tenant Workspace
              </span>
              <div className="space-y-1 mt-1">
                {DEFAULT_WORKSPACES.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                      ws.id === currentUser.workspaceId
                        ? 'bg-[#DFE9FF] text-[#3B6CFF] font-bold'
                        : 'hover:bg-[#F8FAFC] text-[#0B1530]'
                    }`}
                  >
                    <div>
                      <p className="truncate">{ws.name}</p>
                      <p className="text-[10px] text-[#5F6B8A] font-normal">{ws.territory}</p>
                    </div>
                    {ws.id === currentUser.workspaceId && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Provenance Badge: Verified Live DSP */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[rgba(120,140,190,0.2)] shadow-2xs text-xs font-bold text-[#0B1530]">
          <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse"></span>
          <span>Live DSP Verified</span>
        </div>

        {/* User Profile & RBAC Role Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsWorkspaceMenuOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-white/80 hover:bg-white border border-[rgba(120,140,190,0.25)] shadow-2xs cursor-pointer transition-all"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B6CFF] to-[#7C5CFF] text-white font-black text-xs flex items-center justify-center">
                {currentUser.displayName.charAt(0)}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-[#0B1530] block leading-tight">
                {currentUser.displayName}
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(currentUser.role)}`}>
              {currentUser.role.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 text-[#5F6B8A]" />
          </button>

          {/* Profile & RBAC Switcher Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl p-4 shadow-2xl border border-[rgba(120,140,190,0.25)] z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
              <div className="pb-3 border-b border-[rgba(120,140,190,0.2)]">
                <p className="text-xs font-black text-[#0B1530]">{currentUser.displayName}</p>
                <p className="text-[11px] text-[#5F6B8A] truncate">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
                  <span className="text-[10px] text-[#5F6B8A]">
                    UID: <code className="font-mono">{currentUser.uid}</code>
                  </span>
                </div>
              </div>

              {/* RBAC Role Switcher */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#5F6B8A] uppercase tracking-wider block">
                  Switch Active A&R Role
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['ADMIN', 'SENIOR_SCOUT', 'SCOUT', 'VIEWER'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        switchDemoRole(r);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`p-2 rounded-xl text-[11px] font-bold border text-center cursor-pointer transition-all ${
                        currentUser.role === r
                          ? 'bg-[#0B1530] text-white border-[#0B1530]'
                          : 'bg-white hover:bg-[#F8FAFC] text-[#0B1530] border-[rgba(120,140,190,0.2)]'
                      }`}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Sign-in action */}
              <div className="pt-2 border-t border-[rgba(120,140,190,0.2)] flex items-center justify-between">
                <button
                  onClick={() => {
                    if (onGoToAuth) onGoToAuth();
                    else signInWithGoogle();
                    setIsProfileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-[#3B6CFF] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Switch User / Login</span>
                </button>

                <button
                  onClick={async () => {
                    await signOutUser();
                    setIsProfileMenuOpen(false);
                    if (onGoToHome) onGoToHome();
                  }}
                  className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
