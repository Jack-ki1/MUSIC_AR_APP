import React, { useState } from 'react';
import { AuthUser } from '../../types';

interface MsaniiHeaderProps {
  currentUser?: AuthUser;
  onOpenLogin: () => void;
  onOpenAccess: () => void;
  onSignOut?: () => void;
}

export const MsaniiHeader: React.FC<MsaniiHeaderProps> = ({
  currentUser,
  onOpenLogin,
  onOpenAccess,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Brand */}
        <a href="#home" className="brand dark" aria-label="MSANII home">
          <span className="brand-mark"></span>
          <span>MSANII</span>
        </a>

        {/* Navigation Links matching msanii_website_7ca0f69e.html */}
        <nav 
          className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} 
          id="main-nav" 
          aria-label="Main navigation"
        >
          <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Platform⌄</a>
          <a href="#discover" onClick={() => setMobileMenuOpen(false)}>Discover</a>
          <a href="#analyze" onClick={() => setMobileMenuOpen(false)}>Analyze</a>
          <a href="#recommend" onClick={() => setMobileMenuOpen(false)}>Recommend</a>
          <a href="#settings" onClick={() => setMobileMenuOpen(false)}>Settings</a>
          <a href="#design-system" onClick={() => setMobileMenuOpen(false)}>Design System</a>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={onOpenLogin}
                className="btn btn-outline" 
                style={{ color: 'var(--blue)', borderColor: '#cfe4f8' }}
                title="Switch active role / user"
              >
                <span>{currentUser.displayName}</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#eaf4ff] text-[#087fe5]">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="icon-btn text-[10px]"
                  title="Sign out"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <button 
              className="btn btn-outline" 
              style={{ color: 'var(--blue)', borderColor: '#cfe4f8' }} 
              onClick={onOpenLogin}
            >
              Sign in
            </button>
          )}

          <button 
            className="btn btn-lime" 
            onClick={onOpenAccess}
          >
            Request access <span>↗</span>
          </button>

          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu" 
            aria-expanded={mobileMenuOpen}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};
