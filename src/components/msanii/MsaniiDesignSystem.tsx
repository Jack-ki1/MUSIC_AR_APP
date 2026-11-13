import React from 'react';

export const MsaniiDesignSystem: React.FC = () => {
  return (
    <section className="design-section container" id="design-system">
      <div className="design-shell">
        <div className="design-heading">
          <h3>✦ DESIGN SYSTEM</h3>
          <span className="stage-chip">MSANII UI foundations · v1.0</span>
        </div>

        <div className="design-grid">
          {/* 1. Colours */}
          <div className="design-col">
            <h4>Colours</h4>
            <div className="swatches">
              <div>
                <div className="swatch" style={{ background: '#087fe5' }}></div>
                <div className="swatch-label">Primary blue</div>
              </div>
              <div>
                <div className="swatch" style={{ background: '#27b9f5' }}></div>
                <div className="swatch-label">Sky blue</div>
              </div>
              <div>
                <div className="swatch" style={{ background: '#d8fa20' }}></div>
                <div className="swatch-label">Lime green</div>
              </div>
              <div>
                <div className="swatch" style={{ background: '#111820' }}></div>
                <div className="swatch-label">Charcoal</div>
              </div>
              <div>
                <div className="swatch" style={{ background: '#f7f9fc', border: '1px solid #e7edf3' }}></div>
                <div className="swatch-label">Light grey</div>
              </div>
              <div>
                <div className="swatch" style={{ background: '#fff', border: '1px solid #e7edf3' }}></div>
                <div className="swatch-label">White</div>
              </div>
            </div>
          </div>

          {/* 2. Type Scale */}
          <div className="design-col">
            <h4>Type scale</h4>
            <div className="type-sample">
              <strong style={{ fontSize: '22px' }}>Aa</strong>
              <span>Display · 32/40 · Bold</span>
            </div>
            <div className="type-sample">
              <strong style={{ fontSize: '16px' }}>Aa</strong>
              <span>H2 · 20/26 · Semibold</span>
            </div>
            <div className="type-sample">
              <strong style={{ fontSize: '13px' }}>Aa</strong>
              <span>H3 · 14/20 · Semibold</span>
            </div>
            <div className="type-sample">
              <span>Body · 12/18 · Regular</span>
            </div>
            <div className="type-sample">
              <span>Small · 10/14 · Regular</span>
            </div>
            <div className="type-sample">
              <span>Caption · 8/12 · Medium</span>
            </div>
          </div>

          {/* 3. Spacing */}
          <div className="design-col">
            <h4>Spacing (px)</h4>
            <div className="spacing-bars">
              <div className="space-row">4 <span className="space-bar" style={{ width: '14px' }}></span></div>
              <div className="space-row">8 <span className="space-bar" style={{ width: '28px' }}></span></div>
              <div className="space-row">12 <span className="space-bar" style={{ width: '42px' }}></span></div>
              <div className="space-row">16 <span className="space-bar" style={{ width: '56px' }}></span></div>
              <div className="space-row">24 <span className="space-bar" style={{ width: '84px' }}></span></div>
              <div className="space-row">32 <span className="space-bar" style={{ width: '112px' }}></span></div>
              <div className="space-row">48 <span className="space-bar" style={{ width: '145px' }}></span></div>
            </div>
            <p style={{ marginTop: '10px', fontSize: '8px', color: 'var(--muted)' }}>
              Use a 4px base unit for consistent rhythm.
            </p>
          </div>

          {/* 4. Components */}
          <div className="design-col">
            <h4>Components</h4>
            <div className="component-samples">
              <button className="btn btn-primary btn-small" style={{ width: 'max-content' }}>
                Primary button
              </button>
              <button className="btn btn-soft btn-small" style={{ width: 'max-content' }}>
                Secondary button
              </button>
              <span className="sample-chip">Chip label</span>
              <span className="confidence-chip" style={{ width: 'max-content' }}>High confidence</span>
              <div style={{ border: '1px solid var(--line)', borderRadius: '7px', padding: '6px', fontSize: '8px', color: 'var(--muted)' }}>
                Input field · Search artists…
              </div>
              <div style={{ height: '5px', background: '#edf1f5', borderRadius: '99px', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: '82%', background: 'var(--blue)' }}></span>
              </div>
            </div>
          </div>

          {/* 5. Chart Styles */}
          <div className="design-col">
            <h4>Chart styles</h4>
            <div className="chart-samples">
              <div>
                <div className="chart-sample">
                  <svg viewBox="0 0 70 34">
                    <path d="M1 28 12 23 21 25 30 11 42 17 52 7 69 3" fill="none" stroke="#087fe5" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="chart-sample-label">Line</div>
              </div>

              <div>
                <div className="chart-sample">
                  <svg viewBox="0 0 70 34">
                    <path d="M1 29 12 18 21 23 30 9 42 16 52 5 69 2V33H1Z" fill="#b6e4ff"/>
                  </svg>
                </div>
                <div className="chart-sample-label">Area</div>
              </div>

              <div>
                <div className="chart-sample">
                  <svg viewBox="0 0 70 34">
                    <rect x="5" y="17" width="8" height="16" fill="#087fe5"/>
                    <rect x="19" y="9" width="8" height="24" fill="#27b9f5"/>
                    <rect x="33" y="13" width="8" height="20" fill="#b5df00"/>
                    <rect x="47" y="3" width="8" height="30" fill="#087fe5"/>
                  </svg>
                </div>
                <div className="chart-sample-label">Bar</div>
              </div>

              <div>
                <div className="chart-sample">
                  <svg viewBox="0 0 70 34">
                    <rect x="4" y="4" width="20" height="12" fill="#087fe5"/>
                    <rect x="26" y="4" width="15" height="12" fill="#27b9f5"/>
                    <rect x="4" y="18" width="15" height="12" fill="#b5df00"/>
                    <rect x="21" y="18" width="20" height="12" fill="#8bd4fa"/>
                  </svg>
                </div>
                <div className="chart-sample-label">Treemap</div>
              </div>

              <div>
                <div className="chart-sample">
                  <svg viewBox="0 0 70 34">
                    <circle cx="35" cy="17" r="11" fill="none" stroke="#087fe5" strokeWidth="7"/>
                    <path d="M35 6A11 11 0 0 1 44 23" fill="none" stroke="#d8fa20" strokeWidth="7"/>
                  </svg>
                </div>
                <div className="chart-sample-label">Donut</div>
              </div>

              <div>
                <div className="chart-sample">
                  <svg viewBox="0 0 70 34">
                    <path d="M3 5H67M3 16H67M3 27H67" stroke="#dce5ed"/>
                    <path d="M7 5 20 5 33 16 47 16 60 27" stroke="#087fe5" fill="none" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="chart-sample-label">Heatmap</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
