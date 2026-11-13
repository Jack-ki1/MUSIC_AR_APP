import React, { useState } from 'react';
import { UserRole } from '../../types';
import { DEMO_USERS, switchDemoRole } from '../../services/authService';

interface MsaniiModalsProps {
  isAccessOpen: boolean;
  isLoginOpen: boolean;
  focusVisual: { title: string; content: React.ReactNode } | null;
  onCloseModals: () => void;
  onShowToast: (msg: string) => void;
  onLoginRoleSuccess?: (role: UserRole) => void;
}

export const MsaniiModals: React.FC<MsaniiModalsProps> = ({
  isAccessOpen,
  isLoginOpen,
  focusVisual,
  onCloseModals,
  onShowToast,
  onLoginRoleSuccess,
}) => {
  // Access Form state
  const [accessName, setAccessName] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessRole, setAccessRole] = useState('');

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseModals();
    onShowToast(`Invitation request submitted for ${accessName} (${accessEmail}). Welcome to MSANII!`);
    setAccessName('');
    setAccessEmail('');
    setAccessRole('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default sign in as ADMIN
    switchDemoRole('ADMIN');
    onCloseModals();
    if (onLoginRoleSuccess) onLoginRoleSuccess('ADMIN');
    onShowToast(`Signed in securely as ${loginEmail || 'Jackson Kimotho (ADMIN)'}`);
  };

  const handleRoleSelect = (role: UserRole) => {
    switchDemoRole(role);
    onCloseModals();
    if (onLoginRoleSuccess) onLoginRoleSuccess(role);
    const user = DEMO_USERS[role];
    onShowToast(`Active A&R role set to ${user?.displayName || role} (${role})`);
  };

  return (
    <>
      {/* 1. Request Access Modal */}
      {isAccessOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="access-title">
          <div className="modal">
            <button 
              className="icon-btn modal-close" 
              onClick={onCloseModals} 
              aria-label="Close"
            >
              ×
            </button>
            <span className="eyebrow">MSANII access</span>
            <h3 id="access-title">Request an invitation.</h3>
            <p>Tell us a little about your role in the music ecosystem. Access is invite-only for verified A&amp;R professionals.</p>

            <form id="access-form" onSubmit={handleAccessSubmit}>
              <label htmlFor="access-name">Full name</label>
              <input 
                id="access-name" 
                name="name" 
                required 
                placeholder="Jackson Kimotho"
                value={accessName}
                onChange={(e) => setAccessName(e.target.value)}
              />

              <label htmlFor="access-email">Work email</label>
              <input 
                id="access-email" 
                name="email" 
                type="email" 
                required 
                placeholder="kimotho@universalmusic.africa"
                value={accessEmail}
                onChange={(e) => setAccessEmail(e.target.value)}
              />

              <label htmlFor="access-role">Your role</label>
              <input 
                id="access-role" 
                name="role" 
                required 
                placeholder="A&R Lead, Label Director, Talent Scout…"
                value={accessRole}
                onChange={(e) => setAccessRole(e.target.value)}
              />

              <button className="btn btn-primary" type="submit">
                Send access request →
              </button>
            </form>

            <div className="modal-note">
              Invite-only · For verified music-industry professionals
            </div>
          </div>
        </div>
      )}

      {/* 2. Login Modal */}
      {isLoginOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <div className="modal">
            <button 
              className="icon-btn modal-close" 
              onClick={onCloseModals} 
              aria-label="Close"
            >
              ×
            </button>
            <span className="eyebrow">Members only</span>
            <h3 id="login-title">Welcome back.</h3>
            <p>MSANII is an invite-only workspace. Select an authorized seat or use your organization’s credentials.</p>

            {/* Quick Authorized Role Selector */}
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-[var(--line)]">
              <span className="text-[9px] font-black uppercase text-[var(--muted)] tracking-wider block mb-2">
                Authorized Workspace Seats (Direct Access)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN')}
                  className="p-2 rounded-lg bg-white border border-[var(--line)] text-left hover:border-[#087fe5] transition-all"
                >
                  <strong className="text-[10px] block text-[var(--ink)]">Jackson Kimotho</strong>
                  <small className="text-[8px] text-[#087fe5] font-extrabold">ADMIN (Lead Director)</small>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('AR_LEAD')}
                  className="p-2 rounded-lg bg-white border border-[var(--line)] text-left hover:border-[#087fe5] transition-all"
                >
                  <strong className="text-[10px] block text-[var(--ink)]">Sarah Adhiambo</strong>
                  <small className="text-[8px] text-[#7C5CFF] font-extrabold">AR_LEAD (Senior Scout)</small>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('ANALYST')}
                  className="p-2 rounded-lg bg-white border border-[var(--line)] text-left hover:border-[#087fe5] transition-all"
                >
                  <strong className="text-[10px] block text-[var(--ink)]">Kofi Mensah</strong>
                  <small className="text-[8px] text-[#12B76A] font-extrabold">ANALYST (Audio MIR)</small>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('VIEWER')}
                  className="p-2 rounded-lg bg-white border border-[var(--line)] text-left hover:border-[#087fe5] transition-all"
                >
                  <strong className="text-[10px] block text-[var(--ink)]">Executive Guest</strong>
                  <small className="text-[8px] text-[#64748B] font-extrabold">VIEWER (Read-Only)</small>
                </button>
              </div>
            </div>

            <form id="login-form" onSubmit={handleLoginSubmit}>
              <label htmlFor="login-email">Work email</label>
              <input 
                id="login-email" 
                type="email" 
                placeholder="kimothojackson1125@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />

              <label htmlFor="login-password">Password</label>
              <input 
                id="login-password" 
                type="password" 
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />

              <button className="btn btn-primary" type="submit">
                Continue securely →
              </button>
            </form>

            <div className="modal-note">
              Encrypted Firebase Authentication · Multi-tenant separation
            </div>
          </div>
        </div>
      )}

      {/* 3. Visual Focus Overlay Modal */}
      {focusVisual && (
        <div className="focus-overlay" onClick={onCloseModals}>
          <div className="focus-window" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span className="eyebrow">Visual focus mode</span>
                <h3 style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 800 }}>
                  {focusVisual.title}
                </h3>
              </div>
              <button 
                className="icon-btn" 
                onClick={onCloseModals} 
                aria-label="Close focus mode"
              >
                ×
              </button>
            </div>
            <div>
              {focusVisual.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
