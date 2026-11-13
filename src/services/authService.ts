/**
 * Authentication & Workspace RBAC Service
 * Supports Google Firebase Authentication, role management,
 * workspace tenant switching, and permission gate validation.
 */

import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebase';
import { AuthUser, UserRole, WorkspaceTenant } from '../types';

export const DEFAULT_WORKSPACES: WorkspaceTenant[] = [
  {
    id: 'ws-east-africa-hq',
    name: 'Universal East Africa (Nairobi Hub)',
    territory: 'East Africa (KE, TZ, UG, RW)',
    defaultCurrency: 'USD',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'ws-sony-music-africa',
    name: 'Sony Music Africa Discovery Lab',
    territory: 'Sub-Saharan Africa',
    defaultCurrency: 'USD',
    createdAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'ws-indie-scout-collective',
    name: 'Independent A&R Scout Guild',
    territory: 'Global Emerging Markets',
    defaultCurrency: 'USD',
    createdAt: '2026-06-10T00:00:00Z'
  }
];

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  ADMIN: {
    uid: 'usr-admin-jackson',
    email: 'kimothojackson1125@gmail.com',
    displayName: 'Jackson Kimotho',
    role: 'ADMIN',
    workspaceId: 'ws-east-africa-hq',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  AR_LEAD: {
    uid: 'usr-lead-sarah',
    email: 'sarah.mwangi@universal-a-and-r.ke',
    displayName: 'Sarah Mwangi',
    role: 'AR_LEAD',
    workspaceId: 'ws-east-africa-hq',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  ANALYST: {
    uid: 'usr-analyst-kevin',
    email: 'kevin.otieno@scouts.radar.io',
    displayName: 'Kevin Otieno',
    role: 'ANALYST',
    workspaceId: 'ws-east-africa-hq',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  REVIEWER: {
    uid: 'usr-rev-amina',
    email: 'amina.z@breakoutradar.io',
    displayName: 'Amina Zainab',
    role: 'REVIEWER',
    workspaceId: 'ws-east-africa-hq',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  },
  VIEWER: {
    uid: 'usr-viewer-legal',
    email: 'claire.legal@recordgroup.com',
    displayName: 'Claire Wanjiku (Legal Affairs)',
    role: 'VIEWER',
    workspaceId: 'ws-east-africa-hq',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  SENIOR_SCOUT: {
    uid: 'usr-lead-sarah',
    email: 'sarah.mwangi@universal-a-and-r.ke',
    displayName: 'Sarah Mwangi',
    role: 'SENIOR_SCOUT',
    workspaceId: 'ws-east-africa-hq',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  SCOUT: {
    uid: 'usr-analyst-kevin',
    email: 'kevin.otieno@scouts.radar.io',
    displayName: 'Kevin Otieno',
    role: 'SCOUT',
    workspaceId: 'ws-east-africa-hq',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  }
};

/**
 * 15-User Approved Workspace Allowlist
 */
export const APPROVED_WORKSPACE_USERS: AuthUser[] = [
  { uid: 'usr-01', email: 'kimothojackson1125@gmail.com', displayName: 'Jackson Kimotho', role: 'ADMIN', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-02', email: 'sarah.mwangi@universal-a-and-r.ke', displayName: 'Sarah Mwangi', role: 'AR_LEAD', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-03', email: 'david.adebayo@sonymusic.ng', displayName: 'David Adebayo', role: 'AR_LEAD', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-04', email: 'kevin.otieno@scouts.radar.io', displayName: 'Kevin Otieno', role: 'ANALYST', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-05', email: 'leila.chebet@breakoutradar.io', displayName: 'Leila Chebet', role: 'ANALYST', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-06', email: 'kofi.mensah@ghanamusic.a-r', displayName: 'Kofi Mensah', role: 'ANALYST', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-07', email: 'amina.z@breakoutradar.io', displayName: 'Amina Zainab', role: 'REVIEWER', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-08', email: 'brian.ndungu@tastemakers.ke', displayName: 'Brian Ndungu', role: 'REVIEWER', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-09', email: 'tariro.moyo@amapiano.za', displayName: 'Tariro Moyo', role: 'REVIEWER', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-10', email: 'fatou.diallo@dakaracoustic.sn', displayName: 'Fatou Diallo', role: 'REVIEWER', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-11', email: 'claire.legal@recordgroup.com', displayName: 'Claire Wanjiku', role: 'VIEWER', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-12', email: 'marcus.vance@investcapital.com', displayName: 'Marcus Vance', role: 'VIEWER', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-13', email: 'elena.rostova@publishingrights.uk', displayName: 'Elena Rostova', role: 'VIEWER', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-14', email: 'samuel.kamau@syncdeals.ke', displayName: 'Samuel Kamau', role: 'ANALYST', workspaceId: 'ws-east-africa-hq' },
  { uid: 'usr-15', email: 'grace.mutua@indiecollective.org', displayName: 'Grace Mutua', role: 'REVIEWER', workspaceId: 'ws-east-africa-hq' }
];

export type Permission = 
  | 'RECORD_DECISION' 
  | 'OVERRIDE_SCORES' 
  | 'MANAGE_WORKSPACE' 
  | 'TRIGGER_SWEEP' 
  | 'INGEST_AUDIO' 
  | 'RUN_ANALYSIS'
  | 'HUMAN_REVIEW'
  | 'MANAGE_DISCOVERY'
  | 'VIEW_DATA' 
  | 'EXPORT_BRIEF'
  | 'VIEW_AUDIT_LOG'
  | 'INVITE_USERS'
  | 'MANAGE_SECRETS'
  | 'MODIFY_AVM_WEIGHTS';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'RECORD_DECISION',
    'OVERRIDE_SCORES',
    'MANAGE_WORKSPACE',
    'TRIGGER_SWEEP',
    'INGEST_AUDIO',
    'RUN_ANALYSIS',
    'HUMAN_REVIEW',
    'MANAGE_DISCOVERY',
    'VIEW_DATA',
    'EXPORT_BRIEF',
    'VIEW_AUDIT_LOG',
    'INVITE_USERS',
    'MANAGE_SECRETS',
    'MODIFY_AVM_WEIGHTS'
  ],
  AR_LEAD: [
    'RECORD_DECISION',
    'OVERRIDE_SCORES',
    'TRIGGER_SWEEP',
    'INGEST_AUDIO',
    'RUN_ANALYSIS',
    'HUMAN_REVIEW',
    'MANAGE_DISCOVERY',
    'VIEW_DATA',
    'EXPORT_BRIEF',
    'VIEW_AUDIT_LOG',
    'MODIFY_AVM_WEIGHTS'
  ],
  ANALYST: [
    'INGEST_AUDIO',
    'RUN_ANALYSIS',
    'TRIGGER_SWEEP',
    'MANAGE_DISCOVERY',
    'VIEW_DATA',
    'EXPORT_BRIEF'
  ],
  REVIEWER: [
    'HUMAN_REVIEW',
    'OVERRIDE_SCORES',
    'RECORD_DECISION',
    'VIEW_DATA',
    'EXPORT_BRIEF'
  ],
  VIEWER: [
    'VIEW_DATA',
    'EXPORT_BRIEF'
  ],
  SENIOR_SCOUT: [
    'RECORD_DECISION',
    'OVERRIDE_SCORES',
    'TRIGGER_SWEEP',
    'INGEST_AUDIO',
    'RUN_ANALYSIS',
    'HUMAN_REVIEW',
    'MANAGE_DISCOVERY',
    'VIEW_DATA',
    'EXPORT_BRIEF',
    'VIEW_AUDIT_LOG',
    'MODIFY_AVM_WEIGHTS'
  ],
  SCOUT: [
    'INGEST_AUDIO',
    'RUN_ANALYSIS',
    'VIEW_DATA',
    'EXPORT_BRIEF',
    'TRIGGER_SWEEP',
    'RECORD_DECISION'
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isCrossWorkspaceAccessAllowed(userWorkspaceId: string, resourceWorkspaceId: string): boolean {
  return userWorkspaceId === resourceWorkspaceId;
}

export function getCurrentUser(): AuthUser {
  return currentAuthUser;
}

/**
 * Auth state storage and observable listeners
 */
let currentAuthUser: AuthUser = (() => {
  try {
    const saved = localStorage.getItem('breakout_radar_auth_user');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEMO_USERS.ADMIN;
})();

const listeners: Array<(user: AuthUser) => void> = [];

export function getStoredAuthUser(): AuthUser {
  return currentAuthUser;
}

export function subscribeAuth(callback: (user: AuthUser) => void): () => void {
  listeners.push(callback);
  callback(currentAuthUser);
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) listeners.splice(index, 1);
  };
}

function setAndNotifyAuth(user: AuthUser) {
  currentAuthUser = user;
  try {
    localStorage.setItem('breakout_radar_auth_user', JSON.stringify(user));
  } catch {}
  listeners.forEach(cb => cb(user));
}

/**
 * Sign in using Firebase Google popup
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = result.user;
    
    // Check if user is known admin email
    const isAdmin = fbUser.email === 'kimothojackson1125@gmail.com';
    const role: UserRole = isAdmin ? 'ADMIN' : 'SENIOR_SCOUT';

    const authUser: AuthUser = {
      uid: fbUser.uid,
      email: fbUser.email || 'scout@breakoutradar.io',
      displayName: fbUser.displayName || 'A&R Executive',
      role,
      workspaceId: currentAuthUser.workspaceId || 'ws-east-africa-hq',
      avatarUrl: fbUser.photoURL || undefined
    };

    setAndNotifyAuth(authUser);
    return authUser;
  } catch (error) {
    console.warn('[Auth] Google sign in popup fallback to demo session:', error);
    return currentAuthUser;
  }
}

/**
 * Switch role for verification and testing (Admin, Senior Scout, Scout, Viewer)
 */
export function switchDemoRole(role: UserRole): AuthUser {
  const template = DEMO_USERS[role];
  const updated: AuthUser = {
    ...template,
    workspaceId: currentAuthUser.workspaceId
  };
  setAndNotifyAuth(updated);
  return updated;
}

/**
 * Switch active workspace tenant for multi-tenant isolation testing
 */
export function switchWorkspace(workspaceId: string): AuthUser {
  const updated: AuthUser = {
    ...currentAuthUser,
    workspaceId
  };
  setAndNotifyAuth(updated);
  return updated;
}

/**
 * Sign out and reset to Viewer mode
 */
export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    // Ignore error
  }
  setAndNotifyAuth(DEMO_USERS.VIEWER);
}

/**
 * React hook for consuming observable authenticated state and role operations
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser>(getStoredAuthUser);

  useEffect(() => {
    return subscribeAuth(setUser);
  }, []);

  const currentWorkspace = DEFAULT_WORKSPACES.find(w => w.id === user.workspaceId) || DEFAULT_WORKSPACES[0];

  return {
    user,
    currentWorkspace,
    tenants: DEFAULT_WORKSPACES,
    switchRole: switchDemoRole,
    switchTenant: switchWorkspace,
    signInGoogle: signInWithGoogle,
    signOut: signOutUser
  };
}
