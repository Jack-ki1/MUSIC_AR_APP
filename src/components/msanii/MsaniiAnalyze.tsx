import React, { useState } from 'react';
import { RealArtistData, RealSong, DecodedAudioAnalysis } from '../../types';
import { analyzeAudioUrl } from '../../services/audioAnalysisService';

interface MsaniiAnalyzeProps {
  artists: RealArtistData[];
  selectedArtist: RealArtistData | null;
  onSelectArtist: (artist: RealArtistData) => void;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onShowToast: (msg: string) => void;
}

export type MsaniiReportTab = 
  | 'Overview'
  | 'Artistic Value'
  | 'Audience'
  | 'UGC'
  | 'Growth Integrity'
  | 'Trajectory'
  | 'Evidence & Reviews';

export const MsaniiAnalyze: React.FC<MsaniiAnalyzeProps> = ({
  artists,
  selectedArtist,
  onSelectArtist,
  onOpenFocus,
  onShowToast,
}) => {
  const activeArtist = selectedArtist || artists[0];

  // Slicer Filters
  const [activeTab, setActiveTab] = useState<MsaniiReportTab>('Overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '180d' | '12m'>('30d');
  const [platformFilter, setPlatformFilter] = useState('All platforms');
  const [countryFilter, setCountryFilter] = useState('All countries');
  const [compareFilter, setCompareFilter] = useState('No comparison');
  const [sourceMode, setSourceMode] = useState<'Machine' | 'Human'>('Machine');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Audio preview playback
  const [playingSongId, setPlayingSongId] = useState<number | string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Real Web Audio API MIR Analysis
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [decodedMir, setDecodedMir] = useState<DecodedAudioAnalysis | null>(null);

  // Chart hover tooltip state
  const [hoverTip, setHoverTip] = useState<{ text: string; x: number; y: number } | null>(null);

  const reportDescriptions: Record<MsaniiReportTab, string> = {
    'Overview': 'A consolidated view of audience, momentum, creator activity and evidence strength.',
    'Artistic Value': 'A structured, human-reviewed view of craft, identity, originality and artistic potential.',
    'Audience': 'Understand who listens, where they are and how the audience is changing over time.',
    'UGC': 'Track creator-led usage, content formats, diversity and geographic spread.',
    'Growth Integrity': 'Review unusual growth patterns as signals to investigate, with evidence and confidence.',
    'Trajectory': 'Explore the artist’s momentum, comparable artists and possible growth pathways.',
    'Evidence & Reviews': 'Inspect source provenance, review notes, missing evidence and decision history.'
  };

  const handlePlayPreview = (song?: RealSong) => {
    const targetSong = song || activeArtist?.tracks[0];
    if (!targetSong?.previewUrl) {
      onShowToast('No audio preview URL available for this track.');
      return;
    }

    if (playingSongId === targetSong.id && audioElement) {
      if (audioElement.paused) {
        audioElement.play();
      } else {
        audioElement.pause();
        setPlayingSongId(null);
      }
      return;
    }

    if (audioElement) audioElement.pause();

    const audio = new Audio(targetSong.previewUrl);
    audio.play();
    audio.onended = () => setPlayingSongId(null);
    setAudioElement(audio);
    setPlayingSongId(targetSong.id);
    onShowToast(`Streaming real master preview: "${targetSong.title}"`);
  };

  const handleRunAudioMir = async () => {
    const preview = activeArtist?.tracks[0]?.previewUrl;
    if (!preview) {
      onShowToast('No audio preview available to decode.');
      return;
    }
    setIsAnalyzingAudio(true);
    try {
      const result = await analyzeAudioUrl(preview);
      setDecodedMir(result);
      onShowToast(`Real Web Audio MIR Decoded: ${result.rmsLoudnessDb.toFixed(1)} dBFS RMS, ${result.estimatedBpm} BPM!`);
    } catch (e) {
      onShowToast('Web Audio MIR decode failed. Retrying stream...');
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Artist', 'Report', 'DateRange', 'Platform', 'Country', 'Metric', 'Value'];
    const rows = [
      headers,
      [activeArtist?.name || 'Zakira', activeTab, dateRange, platformFilter, countryFilter, 'Monthly Listeners', String(activeArtist?.monthlyListeners || 28400)],
      [activeArtist?.name || 'Zakira', activeTab, dateRange, platformFilter, countryFilter, 'Artistic Score', String(activeArtist?.artisticScore || 4.6)],
      [activeArtist?.name || 'Zakira', activeTab, dateRange, platformFilter, countryFilter, 'Combined Score', String(activeArtist?.combinedScore || 88.5)],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `msanii-${(activeArtist?.name || 'artist').toLowerCase()}-${activeTab.toLowerCase().replace(/[^a-z]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Report CSV exported');
  };

  // Sparkline polyline generator
  const getSparkPoints = (seed: number, isPositive: boolean) => {
    const base = [18, 22, 20, 27, 24, 31, 28, 36, 33];
    return base.map((v, i) => {
      const offset = ((i * 13 + seed * 7) % 9);
      const y = isPositive ? 25 - (v * 0.6 + offset * 0.5) : 10 + (v * 0.4 + offset * 0.5);
      return `${i * 10},${Math.max(2, Math.min(23, y))}`;
    }).join(' ');
  };

  // Dynamically computed KPIs based on active artist and slicers
  const kpis = [
    {
      title: 'Monthly listeners',
      val: countryFilter === 'Kenya' ? '18.2K' : countryFilter === 'Tanzania' ? '5.1K' : countryFilter === 'Uganda' ? '3.4K' : activeArtist?.monthlyListeners ? `${(activeArtist.monthlyListeners / 1000).toFixed(1)}K` : '28.4K',
      delta: activeArtist?.growthSignal7d ? `+${activeArtist.growthSignal7d}%` : '+24%',
      sub: 'vs prior 30d',
      color: '#087fe5'
    },
    {
      title: '30-day momentum',
      val: activeArtist?.growthSignal30d ? `+${activeArtist.growthSignal30d}%` : '+24%',
      delta: '+6pp',
      sub: 'vs prior 30d',
      color: '#087fe5'
    },
    {
      title: 'UGC videos',
      val: platformFilter === 'YouTube' ? '1.2K' : '1.8K',
      delta: '+37%',
      sub: 'vs prior 30d',
      color: '#27b9f5'
    },
    {
      title: 'Creator diversity',
      val: '72%',
      delta: '+8pp',
      sub: 'vs prior 30d',
      color: '#087fe5'
    },
    {
      title: 'Integrity flags',
      val: '3',
      delta: 'Signal review',
      sub: 'open signals',
      color: '#e39a21'
    },
    {
      title: 'Evidence confidence',
      val: sourceMode === 'Human' ? 'Reviewed' : `${activeArtist?.organicConfidence || 85}%`,
      delta: sourceMode === 'Human' ? 'Human' : '+5pp',
      sub: 'vs prior 30d',
      color: '#9acb00'
    }
  ];

  return (
    <section className="product-section" id="analyze">
      <div className="container">
        <div className="product-shell">
          {/* Topline Bar */}
          <div className="product-topline">
            <div className="product-brand">
              <span className="brand-mark" style={{ color: 'var(--blue)' }}></span>
              <div>
                <h2>ANALYZE</h2>
                <p>Power BI-grade artist intelligence · Example artist workspace</p>
              </div>
            </div>

            <div className="product-actions">
              <button 
                className="text-action" 
                onClick={() => {
                  setIsBookmarked(!isBookmarked);
                  onShowToast(isBookmarked ? 'Bookmark removed' : 'Report saved to bookmarks');
                }}
              >
                <span>{isBookmarked ? '★' : '☆'}</span> 
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button className="text-action" onClick={handleExportCSV}>
                <span>⇩</span> <span>Export</span>
              </button>

              <button 
                className="text-action" 
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  onShowToast('Report link copied to clipboard');
                }}
              >
                <span>↗</span> <span>Share</span>
              </button>

              <button 
                className="icon-btn" 
                onClick={() => {
                  setDateRange('30d');
                  setPlatformFilter('All platforms');
                  setCountryFilter('All countries');
                  setCompareFilter('No comparison');
                  setSourceMode('Machine');
                  onShowToast('Report filters reset');
                }}
                aria-label="Reset report"
                title="Reset filters"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Master 2-Column Dashboard Layout */}
          <div className="dashboard-layout">
            {/* Left Report Navigation Sidebar */}
            <aside className="dash-sidebar" aria-label="Report navigation">
              <div className="side-caption">Artist intelligence</div>
              
              <button 
                className={`side-link ${activeTab === 'Overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('Overview')}
              >
                <span className="side-ico">▦</span>Overview
              </button>

              <button 
                className={`side-link ${activeTab === 'Artistic Value' ? 'active' : ''}`}
                onClick={() => setActiveTab('Artistic Value')}
              >
                <span className="side-ico">✧</span>Artistic Value
              </button>

              <button 
                className={`side-link ${activeTab === 'Audience' ? 'active' : ''}`}
                onClick={() => setActiveTab('Audience')}
              >
                <span className="side-ico">◉</span>Audience
              </button>

              <button 
                className={`side-link ${activeTab === 'UGC' ? 'active' : ''}`}
                onClick={() => setActiveTab('UGC')}
              >
                <span className="side-ico">▣</span>UGC
              </button>

              <button 
                className={`side-link ${activeTab === 'Growth Integrity' ? 'active' : ''}`}
                onClick={() => setActiveTab('Growth Integrity')}
              >
                <span className="side-ico">⌁</span>Growth Integrity
              </button>

              <button 
                className={`side-link ${activeTab === 'Trajectory' ? 'active' : ''}`}
                onClick={() => setActiveTab('Trajectory')}
              >
                <span className="side-ico">↗</span>Trajectory
              </button>

              <button 
                className={`side-link ${activeTab === 'Evidence & Reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('Evidence & Reviews')}
              >
                <span className="side-ico">☷</span>Evidence &amp; Reviews
              </button>

              {/* Candidate Switcher Dropdown */}
              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">
                  Select Candidate
                </span>
                <select 
                  value={activeArtist?.id || ''}
                  onChange={(e) => {
                    const match = artists.find(a => a.id === e.target.value);
                    if (match) {
                      onSelectArtist(match);
                      onShowToast(`Switched artist dossier to ${match.name}`);
                    }
                  }}
                  className="w-full text-[9px] p-1.5 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] font-semibold"
                >
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sidebar-foot">
                <b>MSANII intelligence</b>
                Internal workspace<br />
                Access logged · v1.8.2
              </div>
            </aside>

            {/* Main Report Canvas */}
            <div className="dash-main">
              {/* Artist Header */}
              <div className="artist-header">
                <div className="artist-id">
                  <div 
                    className="avatar" 
                    style={activeArtist?.avatarUrl ? {
                      backgroundImage: `url(${activeArtist.avatarUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : undefined}
                  >
                    {!activeArtist?.avatarUrl && <span>{activeArtist?.name.charAt(0) || 'Z'}</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[var(--ink)] tracking-tight">
                        {activeArtist?.name || 'Zakìra'}
                      </h3>
                      <span className="tier-chip">
                        {activeArtist?.recommendationTier || 'PURSUE'}
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span>{activeArtist?.city || 'Nairobi'}, {activeArtist?.country || 'Kenya'}</span>
                      <span>·</span>
                      <span>{activeArtist?.primaryGenre || 'Alté'}</span>
                      <span>·</span>
                      <span>Emerging</span>
                      <span>·</span>
                      <span className="source-chip model">Model</span>
                      <span className="source-chip human">Human</span>
                    </p>
                  </div>
                </div>

                {/* Right Header Action Ribbon (Live Audio Playback & MIR Decode) */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handlePlayPreview()}
                    className={`btn btn-small ${playingSongId ? 'btn-lime' : 'btn-soft'}`}
                    title="Stream Apple Music preview audio"
                  >
                    <span>{playingSongId ? '⏸ Pause' : '▶ Play Preview'}</span>
                  </button>

                  <button
                    onClick={handleRunAudioMir}
                    disabled={isAnalyzingAudio}
                    className="btn btn-small btn-primary"
                    title="Real Web Audio API client-side float buffer signal analysis"
                  >
                    <span>{isAnalyzingAudio ? '◌ Decoding PCM...' : '⚡ Web Audio MIR'}</span>
                  </button>

                  <div className="completeness hidden sm:block">
                    <div className="completeness-top">
                      <span>Data completeness</span>
                      <strong>92%</strong>
                    </div>
                    <div className="meter">
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Web Audio MIR Decoded Banner (When active) */}
              {decodedMir && (
                <div className="mb-3 p-2.5 rounded-xl bg-[#f0f7ff] border border-[#cfe4f8] flex items-center justify-between text-[9px] animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#087fe5]">✓ Web Audio API Decoded:</span>
                    <span>Loudness: <strong>{decodedMir.rmsLoudnessDb.toFixed(1)} dBFS RMS</strong></span>
                    <span>Peak: <strong>{decodedMir.peakDb.toFixed(1)} dBFS</strong></span>
                    <span>Tempo: <strong>{decodedMir.estimatedBpm} BPM</strong></span>
                    <span>Centroid: <strong>{decodedMir.spectralCentroidHz.toFixed(0)} Hz</strong></span>
                    <span>Dynamic Range: <strong>{decodedMir.dynamicRangeDb.toFixed(1)} dB</strong></span>
                  </div>
                  <span className="font-mono text-[8px] text-[var(--muted)]">Float32Array 44.1kHz</span>
                </div>
              )}

              {/* Slicer Bar */}
              <div className="slicer-bar" aria-label="Report filters">
                <div className="filter-group range-group">
                  <label>Date range</label>
                  <div className="range-row">
                    {(['7d', '30d', '90d', '180d'] as const).map(r => (
                      <button 
                        key={r}
                        className={`range-btn ${dateRange === r ? 'active' : ''}`}
                        onClick={() => {
                          setDateRange(r);
                          onShowToast(`Date range set to ${r}`);
                        }}
                      >
                        {r}
                      </button>
                    ))}
                    <button className="range-btn" disabled title="Not enough retained history">
                      12m
                    </button>
                  </div>
                </div>

                <div className="filter-group">
                  <label htmlFor="platform-filter">Platform</label>
                  <select 
                    id="platform-filter"
                    value={platformFilter}
                    onChange={(e) => {
                      setPlatformFilter(e.target.value);
                      onShowToast(`Platform filter: ${e.target.value}`);
                    }}
                  >
                    <option>All platforms</option>
                    <option>Spotify</option>
                    <option>YouTube</option>
                    <option>Apple Music</option>
                    <option>Audiomack</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="country-filter">Country</label>
                  <select 
                    id="country-filter"
                    value={countryFilter}
                    onChange={(e) => {
                      setCountryFilter(e.target.value);
                      onShowToast(`Country filter: ${e.target.value}`);
                    }}
                  >
                    <option>All countries</option>
                    <option>Kenya</option>
                    <option>Tanzania</option>
                    <option>Uganda</option>
                    <option>Rwanda</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="compare-filter">Compare with</label>
                  <select 
                    id="compare-filter"
                    value={compareFilter}
                    onChange={(e) => {
                      setCompareFilter(e.target.value);
                      onShowToast(e.target.value === 'No comparison' ? 'Comparison cleared' : `Comparing with ${e.target.value}`);
                    }}
                  >
                    <option>No comparison</option>
                    <option>Bensoul</option>
                    <option>Kvumbi King</option>
                    <option>Ayra</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Values from</label>
                  <div className="toggle-group">
                    <button 
                      className={sourceMode === 'Machine' ? 'active' : ''}
                      onClick={() => {
                        setSourceMode('Machine');
                        onShowToast('Machine values selected');
                      }}
                    >
                      Machine
                    </button>
                    <button 
                      className={sourceMode === 'Human' ? 'active' : ''}
                      onClick={() => {
                        setSourceMode('Human');
                        onShowToast('Human values selected');
                      }}
                    >
                      Human
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Tabs matching index.html */}
              <div className="report-tabs" role="tablist" aria-label="Analyze report pages">
                {(['Overview', 'Artistic Value', 'Audience', 'UGC', 'Growth Integrity', 'Trajectory', 'Evidence & Reviews'] as MsaniiReportTab[]).map(tab => (
                  <button 
                    key={tab}
                    className={`report-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    role="tab"
                    aria-selected={activeTab === tab}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Report Meta Description & Action Bar */}
              <div className="report-meta">
                <p id="report-description">{reportDescriptions[activeTab]}</p>
                <div className="report-meta-actions">
                  <button 
                    className="text-action" 
                    onClick={() => onOpenFocus(`${activeArtist?.name || 'Artist'} · ${activeTab}`, <div className="p-4">{reportDescriptions[activeTab]}</div>)}
                  >
                    <span>⛶</span> <span>Focus mode</span>
                  </button>
                  <button 
                    className="text-action" 
                    onClick={() => {
                      setActiveTab('Evidence & Reviews');
                      onShowToast('Drilled through to supporting evidence');
                    }}
                  >
                    <span>↳</span> <span>Drill through</span>
                  </button>
                </div>
              </div>

              {/* 6 KPI Cards Grid */}
              <div id="report-kpis" className="kpi-grid">
                {kpis.map((k, i) => (
                  <div key={k.title} className="kpi-card">
                    <small>{k.title}</small>
                    <strong>{k.val}</strong>
                    <div className="kpi-bottom">
                      <span className="delta">{k.delta}</span>
                      <span style={{ color: '#8a96a3' }}>{k.sub}</span>
                    </div>
                    {/* SVG Sparkline */}
                    <svg className="spark" viewBox="0 0 80 25" aria-hidden="true">
                      <polyline 
                        points={getSparkPoints(i + 2, true)} 
                        fill="none" 
                        stroke={k.color} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={`source-chip ${sourceMode === 'Human' ? 'human' : 'model'}`}>
                      {sourceMode === 'Human' ? 'Human reviewed' : 'Model'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Report Interactive Visual Grid */}
              <div id="report-grid" className="report-grid">
                {/* 1. Overview Tab Charts */}
                {activeTab === 'Overview' && (
                  <>
                    {/* Listeners over time */}
                    <article className="chart-card wide">
                      <div className="chart-head">
                        <div>
                          <h4>Listeners over time</h4>
                          <p>Daily listener trend · anomaly band enabled</p>
                        </div>
                        <div className="chart-tools">
                          <button className="chart-tool" onClick={() => onShowToast('Visual bookmark updated')}>☆</button>
                          <button className="chart-tool" onClick={() => onOpenFocus('Listeners over time', <div className="p-4">Expanded view of listeners over time.</div>)}>⛶</button>
                          <button className="chart-tool" onClick={handleExportCSV}>⇩</button>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132" role="img" aria-label="Trend line chart">
                          <g stroke="#edf1f5" strokeWidth="1">
                            <path d="M8 25H330M8 55H330M8 85H330M8 116H330" />
                          </g>
                          <g fill="#8793a1" fontSize="8">
                            <text x="8" y="129">Mar</text>
                            <text x="112" y="129">Apr</text>
                            <text x="220" y="129">May</text>
                          </g>
                          <polygon points="8,116 8,94 43,81 78,86 113,70 148,77 183,60 218,65 253,48 288,54 323,36 323,116" fill="#087fe5" opacity="0.08" />
                          <polyline points="8,94 43,81 78,86 113,70 148,77 183,60 218,65 253,48 288,54 323,36" fill="none" stroke="#087fe5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {[94, 81, 86, 70, 77, 60, 65, 48, 54, 36].map((y, idx) => (
                            <circle 
                              key={idx}
                              className="plot-mark" 
                              cx={8 + idx * 35} 
                              cy={y} 
                              r="3.5" 
                              fill="#087fe5" 
                              stroke="#fff" 
                              strokeWidth="1.5"
                              onMouseEnter={(e) => setHoverTip({ text: `Day ${idx * 3 + 1} · ${(120 - y) * 260} listeners`, x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setHoverTip(null)}
                            />
                          ))}
                        </svg>
                      </div>
                      <div className="chart-legend">
                        <span><i className="legend-dot" style={{ background: '#087fe5' }}></i>Listeners</span>
                        <span><i className="legend-dot" style={{ background: '#d8fa20' }}></i>Expected range</span>
                        <span>◉ Anomaly marker</span>
                      </div>
                    </article>

                    {/* Listeners by platform */}
                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Listeners by platform</h4>
                          <p>Stacked area · cross-filter enabled</p>
                        </div>
                        <div className="chart-tools">
                          <button className="chart-tool">☆</button>
                          <button className="chart-tool">⛶</button>
                          <button className="chart-tool" onClick={handleExportCSV}>⇩</button>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132" role="img" aria-label="Stacked area by platform">
                          <g stroke="#eef2f6">
                            <path d="M8 25H330M8 55H330M8 85H330M8 116H330" />
                          </g>
                          <path d="M8 103 48 91 88 94 128 72 168 76 208 62 248 65 288 47 330 42V116H8Z" fill="#087fe5" opacity="0.75"/>
                          <path d="M8 91 48 78 88 82 128 63 168 66 208 52 248 57 288 38 330 31V42L288 47 248 65 208 62 168 76 128 72 88 94 48 91 8 103Z" fill="#27b9f5"/>
                          <path d="M8 78 48 71 88 70 128 54 168 54 208 39 248 45 288 31 330 23V31L288 38 248 57 208 52 168 66 128 63 88 82 48 78 8 91Z" fill="#d8fa20" opacity="0.85"/>
                        </svg>
                      </div>
                      <div className="chart-legend">
                        <span><i className="legend-dot" style={{ background: '#087fe5' }}></i>Spotify</span>
                        <span><i className="legend-dot" style={{ background: '#27b9f5' }}></i>YouTube</span>
                        <span><i className="legend-dot" style={{ background: '#d8fa20' }}></i>Apple Music</span>
                      </div>
                    </article>

                    {/* Audience Geography East Africa Map */}
                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Audience geography</h4>
                          <p>East Africa · share of listeners</p>
                        </div>
                      </div>
                      <div className="map-panel">
                        <svg viewBox="0 0 300 150" role="img" aria-label="Audience geography in East Africa">
                          <path d="M120 8 151 15 171 30 201 34 220 55 214 72 229 87 215 109 198 120 190 142 170 135 156 119 140 107 119 104 108 86 91 77 97 57 88 40Z" fill="#dceaf2" stroke="#c6d8e5" strokeWidth="1.2"/>
                          <circle 
                            className="map-bubble" 
                            cx="167" cy="91" r="13"
                            onClick={() => onShowToast('Nairobi, Kenya · 42% of listeners')}
                          />
                          <circle 
                            className="map-bubble" 
                            cx="191" cy="119" r="8"
                            onClick={() => onShowToast('Dar es Salaam, Tanzania · 24% of listeners')}
                          />
                          <circle 
                            className="map-bubble" 
                            cx="144" cy="65" r="7"
                            onClick={() => onShowToast('Kampala, Uganda · 18% of listeners')}
                          />
                          <circle 
                            className="map-bubble" 
                            cx="137" cy="88" r="5"
                            onClick={() => onShowToast('Kigali, Rwanda · 9% of listeners')}
                          />
                        </svg>
                      </div>
                    </article>

                    {/* Country by week activity heatmap */}
                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Country by week</h4>
                          <p>Listener activity index · 10-week view</p>
                        </div>
                      </div>
                      <div className="heatmap">
                        {Array.from({ length: 40 }, (_, i) => {
                          const n = (i * 7 + 13) % 10;
                          const a = 0.08 + n * 0.075;
                          return (
                            <span 
                              key={i} 
                              className="heat-cell plot-mark" 
                              style={{ background: `rgba(8,127,229,${a})` }}
                              title={`Activity ${n * 10}%`}
                            />
                          );
                        })}
                      </div>
                      <div className="heat-labels">
                        <span>Week 1</span>
                        <span>Week 5</span>
                        <span>Week 10</span>
                      </div>
                    </article>

                    {/* Waterfall listener change decomposition */}
                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Listener change decomposition</h4>
                          <p>Change vs prior 30 days</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132" role="img" aria-label="Listener change waterfall">
                          <path d="M8 109H330" stroke="#dfe6ed"/>
                          <rect x="16" y="29" width="40" height="80" rx="3" fill="#d8e7f4"/>
                          <rect className="plot-mark" x="68" y="17" width="38" height="33" rx="3" fill="#8bcf13"/>
                          <rect className="plot-mark" x="120" y="50" width="38" height="18" rx="3" fill="#27b9f5"/>
                          <rect className="plot-mark" x="172" y="50" width="38" height="26" rx="3" fill="#e97b7b"/>
                          <rect className="plot-mark" x="224" y="76" width="38" height="20" rx="3" fill="#e97b7b"/>
                          <rect x="278" y="16" width="42" height="93" rx="3" fill="#087fe5"/>
                          <g fill="#738191" fontSize="8" textAnchor="middle">
                            <text x="36" y="123">Start</text>
                            <text x="87" y="123">Organic</text>
                            <text x="139" y="123">UGC</text>
                            <text x="191" y="123">Paid</text>
                            <text x="243" y="123">Other</text>
                            <text x="299" y="123">Now</text>
                          </g>
                          <g fill="#344455" fontSize="8" textAnchor="middle">
                            <text x="36" y="23">24.1K</text>
                            <text x="87" y="12">+4.3K</text>
                            <text x="139" y="45">+2.1K</text>
                            <text x="191" y="45">-1.2K</text>
                            <text x="243" y="71">-0.9K</text>
                            <text x="299" y="11">28.4K</text>
                          </g>
                        </svg>
                      </div>
                    </article>

                    {/* Platform mix Donut */}
                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Platform mix</h4>
                          <p>Share of listeners by source</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 142" role="img" aria-label="Platform mix donut chart">
                          <g transform="translate(84 70) rotate(-90)">
                            <circle r="43" fill="none" stroke="#e9eff4" strokeWidth="18"/>
                            <circle r="43" fill="none" stroke="#087fe5" strokeWidth="18" strokeDasharray="119 270"/>
                            <circle r="43" fill="none" stroke="#27b9f5" strokeWidth="18" strokeDasharray="67 270" strokeDashoffset="-119"/>
                            <circle r="43" fill="none" stroke="#d8fa20" strokeWidth="18" strokeDasharray="45 270" strokeDashoffset="-186"/>
                            <circle r="43" fill="none" stroke="#aab9c8" strokeWidth="18" strokeDasharray="39 270" strokeDashoffset="-231"/>
                          </g>
                          <g fill="#1b2937" textAnchor="middle">
                            <text x="84" y="67" fontSize="18" fontWeight="800">28.4K</text>
                            <text x="84" y="81" fontSize="8" fill="#8391a0">Listeners</text>
                          </g>
                          <g fontSize="9" fill="#667587">
                            <circle cx="170" cy="34" r="4" fill="#087fe5"/><text x="180" y="37">Spotify 44%</text>
                            <circle cx="170" cy="57" r="4" fill="#27b9f5"/><text x="180" y="60">YouTube 25%</text>
                            <circle cx="170" cy="80" r="4" fill="#d8fa20"/><text x="180" y="83">Apple Music 17%</text>
                            <circle cx="170" cy="103" r="4" fill="#aab9c8"/><text x="180" y="106">Others 14%</text>
                          </g>
                        </svg>
                      </div>
                    </article>
                  </>
                )}

                {/* 2. Artistic Value Tab Charts */}
                {activeTab === 'Artistic Value' && (
                  <>
                    <article className="chart-card wide">
                      <div className="chart-head">
                        <div>
                          <h4>Four-pillar artistic value model</h4>
                          <p>Machine-derived and human-reviewed values</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132" role="img" aria-label="Bar chart">
                          <g stroke="#eef2f6">
                            <path d="M8 112H330M8 75H330M8 38H330" />
                          </g>
                          {[82, 76, 88, 71, 79].map((v, idx) => (
                            <rect 
                              key={idx}
                              className="plot-mark"
                              x={22 + idx * 60} 
                              y={112 - v} 
                              width="36" 
                              height={v} 
                              rx="5" 
                              fill={idx % 2 === 0 ? '#087fe5' : '#27b9f5'} 
                              opacity="0.9"
                            />
                          ))}
                          <g fill="#7c8996" fontSize="8">
                            <text x="28" y="126">Orig.</text>
                            <text x="88" y="126">Music.</text>
                            <text x="148" y="126">Sound</text>
                            <text x="208" y="126">Lyrics</text>
                            <text x="268" y="126">Stage</text>
                          </g>
                        </svg>
                      </div>
                      <div className="chart-legend">
                        <span className="source-chip model">Model · v4.2</span>
                        <span className="source-chip human">Human · 08 Nov 2026</span>
                      </div>
                    </article>

                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Human review notes</h4>
                          <p>Reviewer summary</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <p style={{ fontSize: '9px', color: 'var(--muted)', lineHeight: '1.7' }}>
                          “Distinctive vocal phrasing and a coherent visual identity. Needs a full listening session before a final artistic assessment.”
                        </p>
                        <span className="source-chip human mt-3 inline-block">
                          Reviewed by Jackson Kimotho · 08 Nov 2026
                        </span>
                      </div>
                    </article>

                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Scoring provenance</h4>
                          <p>Model and reviewer details</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '9px', lineHeight: '1.8', color: 'var(--muted)' }}>
                        <b style={{ color: 'var(--ink)' }}>Model:</b> MSANII-AVM-4.2<br />
                        <b style={{ color: 'var(--ink)' }}>Version:</b> 4.2.1 · calibrated Nov 2026<br />
                        <b style={{ color: 'var(--ink)' }}>Confidence:</b> 92% aggregate<br />
                        <b style={{ color: 'var(--ink)' }}>Human reviewer:</b> Jackson Kimotho<br />
                        <b style={{ color: 'var(--ink)' }}>Override:</b> Available
                      </div>
                    </article>
                  </>
                )}

                {/* 3. Audience Tab Charts */}
                {activeTab === 'Audience' && (
                  <>
                    <article className="chart-card wide">
                      <div className="chart-head">
                        <div>
                          <h4>Audience growth</h4>
                          <p>Listeners and followers · selected range</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132" role="img" aria-label="Audience growth">
                          <polyline points="8,95 48,88 88,82 128,75 168,69 208,55 248,47 288,38 328,24" fill="none" stroke="#22a98a" strokeWidth="2.5"/>
                        </svg>
                      </div>
                    </article>

                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Country mix</h4>
                          <p>Share by country</p>
                        </div>
                      </div>
                      <div className="map-panel">
                        <p className="text-xs text-[var(--muted)]">Kenya 58% · Tanzania 22% · Uganda 12% · Rwanda 8%</p>
                      </div>
                    </article>
                  </>
                )}

                {/* 4. UGC Tab Charts */}
                {activeTab === 'UGC' && (
                  <>
                    <article className="chart-card wide">
                      <div className="chart-head">
                        <div>
                          <h4>Creator diversity treemap</h4>
                          <p>Content community mix</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132" role="img" aria-label="Creator diversity treemap">
                          <rect x="5" y="5" width="146" height="72" rx="4" fill="#087fe5"/>
                          <rect x="156" y="5" width="86" height="72" rx="4" fill="#27b9f5"/>
                          <rect x="247" y="5" width="88" height="42" rx="4" fill="#d8fa20"/>
                          <rect x="247" y="52" width="88" height="25" rx="4" fill="#8bd4fa"/>
                          <rect x="5" y="82" width="95" height="44" rx="4" fill="#a8c7df"/>
                          <rect x="105" y="82" width="130" height="44" rx="4" fill="#59b7e9"/>
                          <rect x="240" y="82" width="95" height="44" rx="4" fill="#c9e8f8"/>
                          <g fontSize="8" fontWeight="700" fill="#fff">
                            <text x="15" y="27">Dance creators</text>
                            <text x="165" y="28">Lifestyle</text>
                            <text x="255" y="22" fill="#455500">Music</text>
                            <text x="255" y="68" fill="#365267">Comedy</text>
                            <text x="14" y="106">Other</text>
                            <text x="115" y="106">Community</text>
                            <text x="249" y="106" fill="#365267">Remixes</text>
                          </g>
                        </svg>
                      </div>
                    </article>

                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>UGC videos over time</h4>
                          <p>New public creator videos</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132">
                          <polyline points="8,105 48,95 88,90 128,75 168,60 208,45 248,35 288,25 328,15" fill="none" stroke="#27b9f5" strokeWidth="2.5"/>
                        </svg>
                      </div>
                    </article>
                  </>
                )}

                {/* 5. Growth Integrity Tab Charts */}
                {activeTab === 'Growth Integrity' && (
                  <>
                    <article className="chart-card wide">
                      <div className="chart-head">
                        <div>
                          <h4>Signals to investigate</h4>
                          <p>Review flags · not determinations</p>
                        </div>
                      </div>
                      <div className="chart-body" style={{ display: 'grid', gap: '7px' }}>
                        <div style={{ border: '1px solid #f1e2c9', background: '#fffaf0', padding: '9px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '7px' }}>
                            <b style={{ fontSize: '9px' }}>Unusual short-window uplift</b>
                            <span className="confidence-chip" style={{ background: '#fff0d6', color: '#9c6a0c' }}>Medium · 72%</span>
                          </div>
                          <p style={{ fontSize: '8px', color: 'var(--muted)', margin: '4px 0' }}>
                            A short burst in activity differs from the artist’s recent baseline. Signal to investigate, not a conclusion.
                          </p>
                        </div>
                        <div style={{ border: '1px solid #e5edf4', padding: '9px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <b style={{ fontSize: '9px' }}>Creator concentration shift</b>
                            <span className="confidence-chip">Low · 61%</span>
                          </div>
                          <p style={{ fontSize: '8px', color: 'var(--muted)', margin: '4px 0' }}>
                            A small group of creators accounts for a higher share this week. Signal to investigate.
                          </p>
                        </div>
                      </div>
                    </article>

                    <article className="chart-card">
                      <div className="chart-head">
                        <div>
                          <h4>Review guidance</h4>
                          <p>How to interpret signals</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--muted)', lineHeight: '1.65' }}>
                        <b style={{ color: 'var(--ink)' }}>A signal is not a conclusion.</b><br />
                        Flags identify patterns that may deserve human investigation. They do not establish fraud or intent.<br /><br />
                        Review source coverage, timing, geography and independent evidence before acting.
                      </div>
                    </article>
                  </>
                )}

                {/* 6. Trajectory Tab Charts */}
                {activeTab === 'Trajectory' && (
                  <>
                    <article className="chart-card wide">
                      <div className="chart-head">
                        <div>
                          <h4>Momentum trajectory</h4>
                          <p>Historical and near-term scenario bands</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132">
                          <polyline points="8,100 48,90 88,82 128,70 168,60 208,45 248,32 288,24 328,15" fill="none" stroke="#087fe5" strokeWidth="2.5"/>
                        </svg>
                      </div>
                    </article>
                  </>
                )}

                {/* 7. Evidence & Reviews Tab Charts */}
                {activeTab === 'Evidence & Reviews' && (
                  <>
                    <article className="chart-card wide">
                      <div className="chart-head">
                        <div>
                          <h4>Evidence coverage</h4>
                          <p>Completeness by evidence category</p>
                        </div>
                      </div>
                      <div className="chart-body">
                        <svg viewBox="0 0 340 132">
                          {[98, 91, 83, 72, 55].map((v, i) => (
                            <rect key={i} x={25 + i * 62} y={112 - v} width="36" height={v} rx="4" fill="#087fe5"/>
                          ))}
                          <g fill="#7c8996" fontSize="8">
                            <text x="30" y="126">Stream</text>
                            <text x="94" y="126">UGC</text>
                            <text x="156" y="126">Social</text>
                            <text x="218" y="126">Press</text>
                            <text x="278" y="126">Audio</text>
                          </g>
                        </svg>
                      </div>
                    </article>
                  </>
                )}
              </div>

              {/* State Grid Indicators */}
              <div className="state-grid" aria-label="Data and system states">
                <div className="state-card">
                  <div className="state-icon">◌</div>
                  <strong>Loading state</strong>
                  <p>Refreshing source data and model outputs.</p>
                </div>
                <div className="state-card">
                  <div className="state-icon">∅</div>
                  <strong>Empty state</strong>
                  <p>No artist selected. Choose an artist to begin.</p>
                </div>
                <div className="state-card">
                  <div className="state-icon">⌁</div>
                  <strong>Insufficient history</strong>
                  <p>Not enough history for the selected range.</p>
                </div>
                <div className="state-card">
                  <div className="state-icon">!</div>
                  <strong>Error state</strong>
                  <p>Source unavailable. Retry or inspect provider status.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoverTip && (
          <div 
            className="chart-tooltip show" 
            style={{ left: `${Math.min(window.innerWidth - 190, hoverTip.x + 12)}px`, top: `${Math.min(window.innerHeight - 75, hoverTip.y + 12)}px` }}
          >
            {hoverTip.text}
          </div>
        )}
      </div>
    </section>
  );
};
