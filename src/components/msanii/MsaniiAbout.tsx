import React from 'react';

interface MsaniiAboutProps {
  onOpenAccess: () => void;
  onGoToDiscover: () => void;
}

export const MsaniiAbout: React.FC<MsaniiAboutProps> = ({
  onOpenAccess,
  onGoToDiscover,
}) => {
  return (
    <section className="about-section container" id="about">
      {/* Section Heading */}
      <div className="section-heading">
        <span className="eyebrow">About MSANII</span>
        <h2>
          An intelligent A&amp;R platform<br />
          that turns <span className="blue">signals</span> into <span className="lime-text">signatures</span>
        </h2>
        <p>From discovery to decision, MSANII gives your team the clarity and confidence to back artists with real potential.</p>
      </div>

      {/* About Grid */}
      <div className="about-grid">
        <div className="about-photo">
          <span>Talent is everywhere.<br />Find the signal.</span>
        </div>

        <div className="metric-card">
          <small>Artists in view</small>
          <strong>12K+</strong>
          <p>Discovered across East Africa and connected scenes.</p>
          <svg className="metric-graphic" viewBox="0 0 110 50">
            <path d="M3 43 15 39 27 38 39 32 51 29 63 24 75 19 87 10 106 3" fill="none" stroke="#087fe5" strokeWidth="2"/>
            <path d="M3 43 15 39 27 38 39 32 51 29 63 24 75 19 87 10 106 3V50H3Z" fill="#dcedff"/>
          </svg>
        </div>

        <div className="metric-card">
          <small>Data points analysed</small>
          <strong>520K+</strong>
          <p>Updated daily from multiple platforms and sources.</p>
          <svg className="metric-graphic" viewBox="0 0 110 50">
            <path d="M4 46V37M18 46V31M32 46V26M46 46V20M60 46V14M74 46V11M88 46V5M102 46V1" stroke="#72bfff" strokeWidth="6" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="metric-card">
          <small>Model confidence</small>
          <strong>92%</strong>
          <p>Evidence confidence across key artist signals.</p>
          <svg className="metric-graphic" viewBox="0 0 110 50">
            <path d="M1 39 12 35 23 29 34 32 45 17 56 22 67 10 78 17 89 6 109 3" fill="none" stroke="#087fe5" strokeWidth="2"/>
            <path d="M1 39 12 35 23 29 34 32 45 17 56 22 67 10 78 17 89 6 109 3V50H1Z" fill="#e4f3ff"/>
          </svg>
        </div>

        <div className="about-cta">
          <strong>Your next hit<br />is out there.</strong>
          <p>We help you find it first, with evidence and context.</p>
          <button 
            onClick={onGoToDiscover} 
            className="round-arrow" 
            aria-label="Explore discovery"
          >
            ↗
          </button>
        </div>
      </div>

      {/* Access Banner */}
      <div className="access-banner">
        <div className="access-banner-left">
          <div className="lock-emblem">♙</div>
          <div>
            <strong>Invite-only platform for verified industry professionals</strong>
            <p>Join an exclusive community shaping the future of African music. Every action is accountable.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onOpenAccess}>
          Request access <span>♧</span>
        </button>
      </div>
    </section>
  );
};
