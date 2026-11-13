import React from 'react';

interface MsaniiFooterProps {
  onOpenAccess: () => void;
}

export const MsaniiFooter: React.FC<MsaniiFooterProps> = ({ onOpenAccess }) => {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <a href="#home" className="brand dark">
          <span className="brand-mark"></span>
          <span>MSANII</span>
        </a>

        <div className="footer-copy">
          <span>
            <strong>Built for A&amp;R teams.</strong>
            Backed by data. Driven by culture.
          </span>
          <span>
            <strong>East Africa today.</strong>
            African talent tomorrow.
          </span>
          <span>
            <strong>© 2026 MSANII</strong>
            All rights reserved.
          </span>
        </div>

        <div className="footer-end">
          <span>Invite-only access</span>
          <button className="btn btn-lime btn-small" onClick={onOpenAccess}>
            Request access →
          </button>
        </div>
      </div>
    </footer>
  );
};
