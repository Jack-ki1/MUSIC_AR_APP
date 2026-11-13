import React from 'react';
import { RealArtistData } from '../../types';

interface MsaniiHeroProps {
  featuredArtist?: RealArtistData;
  onOpenAccess: () => void;
  onGoToAnalyze: () => void;
}

export const MsaniiHero: React.FC<MsaniiHeroProps> = ({
  featuredArtist,
  onOpenAccess,
  onGoToAnalyze,
}) => {
  const artistName = featuredArtist?.name || 'Zakìra';
  const artistMeta = featuredArtist 
    ? `${featuredArtist.city}, ${featuredArtist.country} · ${featuredArtist.primaryGenre}` 
    : 'Nairobi, Kenya · Alté / Afro-pop';
  const listenersCount = featuredArtist 
    ? (featuredArtist.monthlyListeners >= 1000 ? `${(featuredArtist.monthlyListeners / 1000).toFixed(1)}K` : featuredArtist.monthlyListeners)
    : '28.4K';
  const growthRate = featuredArtist?.growthSignal30d ? `+${featuredArtist.growthSignal30d}%` : '+24%';

  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        {/* Left Copy Column */}
        <div className="hero-copy">
          <div className="hero-kicker">The A&R intelligence platform for Africa</div>
          <h1>
            Discover. Understand.<br />
            Back the next<br />
            <span>big sound.</span>
          </h1>
          <p>
            MSANII is the internal A&amp;R platform that uses data, culture and human expertise to find and evaluate Africa’s next generation of artists.
          </p>
          <div className="hero-ctas">
            <button 
              className="btn btn-outline" 
              onClick={onGoToAnalyze}
            >
              <span>▶</span> See platform
            </button>
            <button 
              className="btn btn-lime" 
              onClick={onOpenAccess}
            >
              Request access <span>→</span>
            </button>
          </div>
          <div className="hero-note">
            <span></span> Focused on East Africa · Built for the wider African music ecosystem
          </div>
        </div>

        {/* Right Visual Column with Geometric Map & Dynamic Badges */}
        <div className="hero-visual" aria-label="Artist intelligence preview">
          <div className="hero-orbit"></div>
          
          {/* Abstract SVG Map of Africa */}
          <svg className="hero-map" viewBox="0 0 340 360" role="img" aria-label="Abstract outline of Africa">
            <path 
              d="M135 12 184 26 211 52 245 58 260 95 290 115 277 148 290 181 263 205 251 252 225 284 211 331 185 347 164 313 147 285 130 258 118 226 86 210 77 174 49 153 65 116 54 83 82 58 108 42Z" 
              fill="none" 
              stroke="#fff" 
              strokeWidth="3" 
              strokeLinejoin="round"
            />
            <path 
              d="M137 18 181 32 201 57 232 67 248 100 274 119 262 148 276 179 250 204 240 248 219 278 205 319 185 330 169 302 152 273 137 245 124 215 94 198 87 171 60 151 75 120 66 89 90 67 112 52Z" 
              fill="#d9faff" 
              opacity="0.18"
            />
            <path 
              d="m180 32 18 49-9 38 28 30-12 50-37 34-8 54m-64-169 41 13 29 31-3 43 36 28m-61-178-12 44 19 25-3 32" 
              fill="none" 
              stroke="#fff" 
              strokeWidth="1.3" 
              opacity="0.65"
            />
          </svg>

          <span className="orbit-dot a"></span>
          <span className="orbit-dot b"></span>

          {/* Floating Stat 1: Evidence Confidence */}
          <div className="float-stat one">
            <small>Evidence confidence</small>
            <strong>85%</strong>
            <span className="up">↗ 5.6%</span>
            <svg className="mini-line" viewBox="0 0 100 30">
              <path d="M2 26 17 22 29 24 42 12 55 17 67 9 81 12 98 2" fill="none" stroke="#087fe5" strokeWidth="2"/>
            </svg>
          </div>

          {/* Floating Stat 2: Growth Momentum */}
          <div className="float-stat two">
            <small>Growth momentum</small>
            <strong>{growthRate}</strong>
            <span className="up">vs prior 30d</span>
            <svg className="mini-line" viewBox="0 0 100 30">
              <path d="M2 26 17 23 27 25 38 15 49 18 63 9 73 13 88 3 98 5" fill="none" stroke="#9acb00" strokeWidth="2"/>
            </svg>
          </div>

          {/* Hero Artist Preview Card */}
          <div className="hero-card">
            <div 
              className="artist-cover"
              style={featuredArtist?.avatarUrl ? {
                backgroundImage: `linear-gradient(0deg, rgba(0, 24, 49, 0.75), transparent 60%), url(${featuredArtist.avatarUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : undefined}
            >
              <strong>
                {artistName}
                <small>{artistMeta}</small>
              </strong>
            </div>
            <div className="hero-card-meta">
              <div>
                <span>Monthly listeners</span>
                <b>{listenersCount}</b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="up">{growthRate} ↗</span>
                <svg className="mini-line" viewBox="0 0 100 30">
                  <path d="M1 26 13 20 24 23 37 11 51 15 63 8 76 12 89 3 99 5" fill="none" stroke="#087fe5" strokeWidth="2.3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
