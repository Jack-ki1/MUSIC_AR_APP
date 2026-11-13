import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Compass, 
  Radio, 
  Check, 
  Headphones, 
  Database, 
  Layers, 
  TrendingUp, 
  Award,
  Lock,
  Globe2,
  ChevronRight,
  Flame,
  Zap,
  Play
} from 'lucide-react';
import { RealArtistData } from '../../types';

interface CreativeHomepageProps {
  onEnterApp: () => void;
  onGoToAuth: (mode?: 'signin' | 'signup') => void;
  featuredArtists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
}

export const CreativeHomepage: React.FC<CreativeHomepageProps> = ({
  onEnterApp,
  onGoToAuth,
  featuredArtists,
  onSelectArtist
}) => {
  return (
    <div className="min-h-screen bg-[#070D1E] text-white selection:bg-[#C8F51F] selection:text-[#0B1530] relative overflow-hidden font-sans">
      {/* Precise architectural grid */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#94A3B8 1px, transparent 1px), linear-gradient(90deg, #94A3B8 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Sticky Navigation Header */}
      <header className="relative z-30 border-b border-white/10 backdrop-blur-xl bg-[#070D1E]/60 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B6CFF] to-[#C8F51F] p-[1.5px] shadow-[0_0_25px_rgba(200,245,31,0.35)]">
              <div className="w-full h-full bg-[#0B1530] rounded-2xl flex items-center justify-center">
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="#C8F51F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 8h3l2-6 3 12 3-10 2 4h7" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-extrabold text-lg tracking-tight text-white">Breakout</span>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#C8F51F] via-[#3B6CFF] to-[#7C5CFF] bg-clip-text text-transparent">Radar</span>
              </div>
              <p className="text-[9px] font-mono tracking-widest text-[#7C5CFF] uppercase font-bold">
                A&R COGNITIVE RADAR
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-[#C8F51F] transition-colors">Surveillance</a>
            <a href="#avm-engine" className="hover:text-[#C8F51F] transition-colors">AVM Engine</a>
            <a href="#candidates" className="hover:text-[#C8F51F] transition-colors">Upcoming Talent</a>
            <a href="#security" className="hover:text-[#C8F51F] transition-colors">Compliance</a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onGoToAuth('signin')}
              className="px-4 py-2 rounded-full text-xs font-bold text-white hover:text-[#C8F51F] transition-colors cursor-pointer border border-white/10 hover:border-white/25"
            >
              Sign In
            </button>
            <button
              onClick={() => onGoToAuth('signup')}
              className="px-5 py-2.5 rounded-full text-xs font-black bg-[#C8F51F] text-[#0B1530] hover:bg-[#d8ff3d] hover:shadow-[0_0_24px_rgba(200,245,31,0.5)] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#3B6CFF]/20 via-[#7C5CFF]/20 to-[#C8F51F]/20 border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#C8F51F] animate-ping" />
            <span className="text-[11px] font-black tracking-wider uppercase text-[#C8F51F]">
              EAST AFRICA DISCOVERY DESK · AVM v2.4.2 ACTIVE
            </span>
          </div>

          {/* Punchy Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            Discover the next breakout artist{' '}
            <span className="bg-gradient-to-r from-[#C8F51F] via-[#3B6CFF] to-[#FF8A3D] bg-clip-text text-transparent">
              before the mainstream catches on.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Autonomous A&R surveillance analyzing 70+ streaming, catalogue, and social signals. 
            Objective mathematical scoring with the 4-Pillar <strong>Artistic Value Model (AVM)</strong>.
          </p>

          {/* CTA Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onGoToAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-black bg-gradient-to-r from-[#C8F51F] to-[#b3e012] text-[#0B1530] hover:shadow-[0_0_35px_rgba(200,245,31,0.6)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Discovery Radar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-7 py-4 rounded-full text-sm font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#3B6CFF]" />
              <span>Enter Live Workspace</span>
            </button>
          </div>

          {/* Real-Time Live Radar Stat Ribbon */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-[#C8F51F]">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase">Surveillance</span>
              </div>
              <p className="text-2xl font-black text-white mt-2">73 Sources</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Live DSP & Catalogues</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-[#3B6CFF]">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase">Model</span>
              </div>
              <p className="text-2xl font-black text-white mt-2">AVM 4-Pillars</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Objective Talent Index</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-[#FF8A3D]">
                <Flame className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase">Focus</span>
              </div>
              <p className="text-2xl font-black text-white mt-2">100% Emerging</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Superstars Filtered</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase">Audit Ledger</span>
              </div>
              <p className="text-2xl font-black text-white mt-2">SHA-256</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tamper-Evident RBAC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Upcoming Artist Spotlight */}
      <section id="candidates" className="relative z-20 py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8F51F]">
              AUTHENTIC DISCOVERY PIPELINE
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Top Emerging East African Candidates
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Source-backed metrics with real Apple Music preview streams and verified audio master analysis.
            </p>
          </div>
          <button
            onClick={onEnterApp}
            className="self-start md:self-auto text-xs font-bold text-[#C8F51F] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Candidate Radar ({featuredArtists.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Artist Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArtists.slice(0, 3).map((artist, idx) => (
            <div
              key={artist.id}
              className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#C8F51F]/40 transition-all group backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="font-extrabold text-lg text-white group-hover:text-[#C8F51F] transition-colors">
                        {artist.name}
                      </h3>
                      <p className="text-xs text-[#3B6CFF] font-semibold">{artist.primaryGenre}</p>
                      <p className="text-[11px] text-slate-400">{artist.city}, {artist.country}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    artist.recommendationTier === 'PURSUE'
                      ? 'bg-[#C8F51F] text-[#0B1530]'
                      : artist.recommendationTier === 'MEET'
                      ? 'bg-[#3B6CFF] text-white'
                      : 'bg-white/20 text-white'
                  }`}>
                    {artist.recommendationTier}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed">
                  {artist.summary}
                </p>

                {/* AVM Breakdown Pills */}
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.03]">
                    <span className="text-[9px] text-slate-400 block font-mono">AVM AAV</span>
                    <strong className="text-xs text-[#C8F51F] font-mono">
                      {artist.avmRollup.aav}/100
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03]">
                    <span className="text-[9px] text-slate-400 block font-mono">DISCOVERY</span>
                    <strong className="text-xs text-[#3B6CFF] font-mono">
                      {artist.discoveryScore.toFixed(0)}/100
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03]">
                    <span className="text-[9px] text-slate-400 block font-mono">STABILITY</span>
                    <strong className="text-xs text-emerald-400 font-mono">
                      {artist.avmRollup.consistency}/100
                    </strong>
                  </div>
                </div>

                {/* Audio Preview Indicator */}
                {artist.tracks[0]?.previewUrl && (
                  <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-black/40 text-[11px] text-slate-300 font-mono">
                    <Headphones className="w-3.5 h-3.5 text-[#C8F51F]" />
                    <span className="truncate flex-1">{artist.tracks[0].title}</span>
                    <span className="text-[10px] text-slate-400">30s AAC</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {artist.monthlyListeners.toLocaleString()} monthly streams
                </span>
                <button
                  onClick={() => {
                    onSelectArtist(artist);
                    onEnterApp();
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-[#C8F51F] hover:text-[#0B1530] text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Analyse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AVM Engine Methodology Explanation */}
      <section id="avm-engine" className="relative z-20 py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3B6CFF]">
            A&R CORE MATHEMATICAL SPECIFICATION
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Artistic Value Model (AVM) v2.4.2
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Unlike crude stream counters that inflate established stars, AVM decomposes raw audio and lyrical composition into 4 calibrated pillars to locate high-potential, unpolished alpha talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 text-[#3B6CFF] flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-white text-base">Vocal Execution</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CREPE pitch intonation cent-tracking, vibrato rate (Hz), tessitura range, and formant harmonic clarity.
            </p>
            <div className="text-[10px] font-mono text-[#C8F51F] font-bold">Weight: 30% · Objective</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-white text-base">Writing & Lyricism</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Rhyme density, internal multisyllabic phonetics, metaphor index, and regional Sheng/Swahili code-switching lexicon.
            </p>
            <div className="text-[10px] font-mono text-[#C8F51F] font-bold">Weight: 30% · Objective</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1FB6E8]/20 text-[#1FB6E8] flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-white text-base">Songcraft & Hook</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Melodic contour, phrase memorability, dynamic energy curve delta, and tension-release harmonic cycles.
            </p>
            <div className="text-[10px] font-mono text-[#C8F51F] font-bold">Weight: 20% · Objective</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF8A3D]/20 text-[#FF8A3D] flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="font-bold text-white text-base">Sonic Composition</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stem separation analysis, frequency spectrum balance, transient clarity, and production bonus capped at +3.0 pts.
            </p>
            <div className="text-[10px] font-mono text-[#C8F51F] font-bold">Weight: 20% · Objective</div>
          </div>
        </div>

        {/* High Potential, Low Production Banner */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-[#C8F51F]/15 via-[#3B6CFF]/15 to-transparent border border-[#C8F51F]/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8F51F]" />
              <h4 className="font-extrabold text-white text-sm">
                The Alpha Signal: "High Talent, Low Production Polish"
              </h4>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When a candidate scores TAV $\ge 68$ while having a Production Index $&lt; 50$, the algorithm flags them for priority outreach. This guarantees scouts catch raw musicians before high studio budgets inflate their price.
            </p>
          </div>
          <button
            onClick={() => onGoToAuth('signup')}
            className="px-6 py-3 rounded-full text-xs font-black bg-[#C8F51F] text-[#0B1530] hover:shadow-[0_0_20px_rgba(200,245,31,0.5)] transition-all cursor-pointer shrink-0"
          >
            Access A&R Workspace
          </button>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section id="security" className="relative z-20 py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            ENTERPRISE GOVERNANCE & PROVENANCE
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Built for Major Labels & Indie Desks
          </h2>
          <p className="text-xs text-slate-400">
            Strict multi-tenant workspace isolation, role-based authorization, and immutable SHA-256 audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <Lock className="w-6 h-6 text-[#3B6CFF]" />
            <h3 className="font-bold text-white text-sm">Multi-Tenant RBAC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Separate workspaces for Universal East Africa, Sony Africa Lab, and Indie Guild. Strict boundary tests guarantee zero cross-workspace data leakage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <Award className="w-6 h-6 text-[#C8F51F]" />
            <h3 className="font-bold text-white text-sm">Dual Human & Machine Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algorithmic machine scores never overwrite scout instincts. Divergence tracking logs human vs. machine deltas to continuously audit model calibration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <Globe2 className="w-6 h-6 text-[#7C5CFF]" />
            <h3 className="font-bold text-white text-sm">Audio Rights Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated ingestion checks master ownership, signed publishing splits, 44.1kHz bit depth, and LUFS headroom before any track reaches signing review.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 py-12 px-6 bg-[#040813]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#0B1530] border border-[#C8F51F]/40 flex items-center justify-center">
              <svg width="16" height="12" viewBox="0 0 22 16" fill="none" stroke="#C8F51F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8h3l2-6 3 12 3-10 2 4h7" />
              </svg>
            </div>
            <span className="font-extrabold text-white">Breakout Radar</span>
            <span>· Autonomous Music Intelligence Engine</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>Methodology: AVM-v2.4.2-EAST_AFRICA</span>
            <span>Live DSP Synced</span>
            <span>Deployed to Google Cloud</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
