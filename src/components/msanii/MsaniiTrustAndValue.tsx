import React from 'react';

export const MsaniiTrustAndValue: React.FC = () => {
  return (
    <>
      {/* Trust Strip */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-label">Built for forward-thinking music teams</div>
          <div className="logo-row">
            <span className="logo-placeholder"><i className="logo-symbol">✦</i> Label teams</span>
            <span className="logo-placeholder"><i className="logo-symbol">◈</i> Streaming data</span>
            <span className="logo-placeholder"><i className="logo-symbol">✧</i> Creator culture</span>
            <span className="logo-placeholder"><i className="logo-symbol">◉</i> Music publishers</span>
            <span className="logo-placeholder"><i className="logo-symbol">✣</i> Talent scouts</span>
            <span className="logo-placeholder"><i className="logo-symbol">≋</i> More partners</span>
          </div>
        </div>
      </section>

      {/* Value Strip (5 Foundations) */}
      <section className="container value-strip" id="platform" aria-label="Platform benefits">
        <div className="value-item">
          <div className="value-icon">♧</div>
          <div>
            <strong>Built for A&amp;R teams</strong>
            <small>Streamline discovery and evaluation with one workspace.</small>
          </div>
        </div>
        <div className="value-item">
          <div className="value-icon">▣</div>
          <div>
            <strong>Data + Culture</strong>
            <small>Machine intelligence meets human judgement.</small>
          </div>
        </div>
        <div className="value-item">
          <div className="value-icon">♧</div>
          <div>
            <strong>East Africa first</strong>
            <small>Kenya, Tanzania, Uganda, Rwanda and beyond.</small>
          </div>
        </div>
        <div className="value-item">
          <div className="value-icon">♢</div>
          <div>
            <strong>Secure by design</strong>
            <small>Enterprise-grade security and audit trails.</small>
          </div>
        </div>
        <div className="value-item">
          <div className="value-icon">↗</div>
          <div>
            <strong>Actionable insights</strong>
            <small>Clear recommendations and next steps.</small>
          </div>
        </div>
      </section>
    </>
  );
};
